// Copyright 2012 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {AlphaRenamer} from '../AlphaRenamer';
import {BreakContinueTransformer} from './BreakContinueTransformer';
import {
  BLOCK,
  BREAK_STATEMENT,
  CASE_CLAUSE,
  CONDITIONAL_EXPRESSION,
  CONTINUE_STATEMENT,
  EXPRESSION_STATEMENT,
  PAREN_EXPRESSION,
  STATE_MACHINE
} from '../../syntax/trees/ParseTreeType';
import {
  AnonBlock,
  Block,
  CaseClause,
  IfStatement,
  SwitchStatement
} from '../../syntax/trees/ParseTrees';
import {CatchState} from './CatchState';
import {ConditionalState} from './ConditionalState';
import {ExplodeExpressionTransformer} from '../ExplodeExpressionTransformer';
import {FallThroughState} from './FallThroughState';
import {FinallyFallThroughState} from './FinallyFallThroughState';
import {FinallyState} from './FinallyState';
import {FindInFunctionScope} from '../FindInFunctionScope';
import {ParseTreeTransformer} from '../ParseTreeTransformer';
import {TempVarTransformer} from '../TempVarTransformer';
import {assert} from '../../util/assert';
import {
  parseExpression,
  parseStatement,
  parseStatements
} from '../PlaceholderParser';
import {State} from './State';
import {StateAllocator} from './StateAllocator';
import {StateMachine} from '../../syntax/trees/StateMachine';
import {
  SwitchClause,
  SwitchState
} from './SwitchState';
import {TryState} from './TryState';
import {
  createAssignStateStatement,
  createBreakStatement,
  createCaseClause,
  createDefaultClause,
  createExpressionStatement,
  createFunctionBody,
  createIdentifierExpression as id,
  createMemberExpression,
  createNumberLiteral,
  createStatementList,
  createSwitchStatement,
} from '../ParseTreeFactory';
import HoistVariablesTransformer from '../HoistVariablesTransformer';

class LabelState {
  constructor(name, continueState, fallThroughState) {
    this.name = name;
    this.continueState = continueState;
    this.fallThroughState = fallThroughState;
  }
}

class NeedsStateMachine extends FindInFunctionScope {
  visitBreakStatement(tree) {
    this.found = true;
  }
  visitContinueStatement(tree) {
    this.found = true;
  }
  visitStateMachine(tree) {
    this.found = true;
  }
  visitYieldExpression(tee) {
    this.found = true;
  }
}

function needsStateMachine(tree) {
  var visitor = new NeedsStateMachine(tree);
  return visitor.found;
}

class HoistVariables extends HoistVariablesTransformer {
  /**
   * Override to not inject the hoisted variables. We will manually inject them
   * later.
   */
  prependVariables(statements) {
    return statements;
  }
}

/**
 * Performs a CPS transformation on a method body.
 *
 * The conversion transformation proceeds bottom up. At the bottom Yield
 * statements are converted to a state machine, then when a transformed child
 * statement is a state machine, the parent statement is converted into a state
 * machine.
 *
 * At the top level the state machine is translated into this method:
 *
 *      function() {
 *       while (true) {
 *         try {
 *           switch ($ctx.state) {
 *           ... converted states ...
 *           case rethrow:
 *             throw $ctx.storedException;
 *           }
 *         } catch ($caughtException) {
 *           $ctx.storedException = $caughtException;
 *           switch ($ctx.state) {
 *           case enclosing_finally:
 *             $ctx.state = finally.startState;
 *             $fallThrough = rethrow;
 *             break;
 *           case enclosing_catch:
 *             $ctx.state = catch.startState;
 *             break;
 *           case enclosing_catch_around_finally:
 *             $ctx.state = finally.startState;
 *             $fallThrough = catch.startState;
 *             break;
 *           default:
 *             throw $ctx.storedException;
 *           }
 *         }
 *       }
 *     }
 *
 * Each state in a state machine is identified by an integer which is unique
 * across the entire function body. The state machine merge process may need to
 * perform state id substitution on states of the merged state machines.
 */
export class CPSTransformer extends TempVarTransformer {
  /**
   * @param {ErrorReporter} reporter
   */
  constructor(identifierGenerator, reporter) {
    super(identifierGenerator);
    this.reporter = reporter;
    this.stateAllocator_ = new StateAllocator();
    this.labelSet_ = Object.create(null);
    this.currentLabel_ = null;
    this.hoistVariablesTransformer_ = new HoistVariables();
  }

  expressionNeedsStateMachine(tree) {
    // TODO(arv): Implement this for the async transformer.
    return false;
  }

  /** @return {number} */
  allocateState() {
    return this.stateAllocator_.allocateState();
  }

  /**
   * If a block contains a statement which has been transformed into a state
   * machine, then all statements are forcibly transformed into a state
   * machine, then the machines are knitted together.
   * @param {Block} tree
   * @return {ParseTree}
   */
  transformBlock(tree) {
    var labels = this.getLabels_();
    var label = this.clearCurrentLabel_();

    // NOTE: tree may contain state machines already ...
    var transformedTree = super.transformBlock(tree);
    var machine = this.transformStatementList_(transformedTree.statements);

    if (machine === null)
      return transformedTree;

    if (label) {
      var states = [];
      for (var i = 0; i < machine.states.length; i++) {
        var state = machine.states[i];
        states.push(state.transformBreakOrContinue(labels));
      }
      machine = new StateMachine(machine.startState, machine.fallThroughState,
                                 states, machine.exceptionBlocks);
    }

    return machine;
  }

  transformFunctionBody(tree) {
    this.pushTempVarState();

    // NOTE: tree may contain state machines already ...
    var oldLabels = this.clearLabels_();

    var transformedTree = super.transformFunctionBody(tree);
    var machine = this.transformStatementList_(transformedTree.statements);

    this.restoreLabels_(oldLabels);

    this.popTempVarState();
    return machine == null ? transformedTree : machine;
  }

  /**
   * @param {Array.<ParseTree>} trees This may already contain StateMachine
   *     trees.
   * @return {StateMachine}
   */
  transformStatementList_(trees) {
    // If we need one or more machines, we want to aggregate the machines andany
    // free statements into one state machine.

    var groups = [];
    var newMachine;
    for (var i = 0; i < trees.length; i++) {
      if (trees[i].type === STATE_MACHINE) {
        groups.push(trees[i]);
      } else if (needsStateMachine(trees[i])) {
        newMachine = this.ensureTransformed_(trees[i]);
        groups.push(newMachine);
      } else {
        // Accumulate trees.
        var last = groups[groups.length - 1];
        if (!(last instanceof Array))
          groups.push(last = []);
        last.push(trees[i])
      }
    }

    if (groups.length === 1 && groups[0] instanceof Array)
      return null;

    var machine = null;

    for (var i = 0; i < groups.length; i++) {
      if (groups[i] instanceof Array) {
        newMachine = this.statementsToStateMachine_(groups[i]);
      } else {
        newMachine = groups[i];
      }
      if (i === 0)
        machine = newMachine;
      else
        machine = machine.append(newMachine);
    }

    return machine;
  }

  /**
   * @param {Array.<ParseTree>|SwitchStatement} statements
   * @return {boolean}
   */
  needsStateMachine_(statements) {
    if (statements instanceof Array) {
      for (var i = 0; i < statements.length; i++) {
        if (needsStateMachine(statements[i]))
          return true;
      }
      return false;
    }

    assert(statements instanceof SwitchStatement);
    return needsStateMachine(statements);
  }

  /**
   * @param {CaseClause} tree
   * @return {ParseTree}
   */
  transformCaseClause(tree) {
    var result = super.transformCaseClause(tree);
    var machine = this.transformStatementList_(result.statements);
    return machine == null ?
        result :
        new CaseClause(null, result.expression, createStatementList(machine));
  }

  /**
   * @param {DoWhileStatement} tree
   * @return {ParseTree}
   */
  transformDoWhileStatement(tree) {
    var labels = this.getLabels_();
    var label = this.clearCurrentLabel_();

    var machine, condition, body;
    if (this.expressionNeedsStateMachine(tree.condition)) {
      ({machine, expression: condition} =
          this.expressionToStateMachine(tree.condition));
      body = this.transformAny(tree.body);
    } else {
      var result = super(tree);
      ({condition, body} = result);
      if (body.type != STATE_MACHINE)
        return result;
    }

    // a yield within a do/while loop
    var loopBodyMachine = this.ensureTransformed_(body);
    var startState = loopBodyMachine.startState;
    var conditionState = loopBodyMachine.fallThroughState;
    var fallThroughState = this.allocateState();

    var states = [];

    this.addLoopBodyStates_(loopBodyMachine, conditionState, fallThroughState,
                            labels, states);

    if (machine) {
      machine = machine.replaceStartState(conditionState);
      conditionState = machine.fallThroughState;
      states.push(...machine.states);
    }

    states.push(
        new ConditionalState(
            conditionState,
            startState,
            fallThroughState,
            condition));

    var machine = new StateMachine(startState, fallThroughState, states,
                                   loopBodyMachine.exceptionBlocks);

    if (label)
      machine = machine.replaceStateId(conditionState, label.continueState);

    return machine;
  }

  /**
   * @param {StateMachine} loopBodyMachine
   * @param {number} continueState
   * @param {number} breakState
   * @param {Object} labels
   * @param {Array.<State>} states
   */
  addLoopBodyStates_(loopBodyMachine, continueState, breakState,
                     labels, states) {
    for (var i = 0; i < loopBodyMachine.states.length; i++) {
      var state = loopBodyMachine.states[i];
      states.push(
          state.transformBreakOrContinue(labels, breakState, continueState));
    }
  }

  /**
   * @param {ForStatement} tree
   * @return {ParseTree}
   */
  transformForStatement(tree) {
    var labels = this.getLabels_();
    var label = this.clearCurrentLabel_();
    var tmp;

    var initialiser = null, initialiserMachine;
    if (tree.initialiser) {
      if (this.expressionNeedsStateMachine(tree.initialiser)) {
        tmp = this.expressionToStateMachine(tree.initialiser);
        initialiser = tmp.expression;
        initialiserMachine = tmp.machine;
      } else {
        initialiser = this.transformAny(tree.initialiser);
      }
    }

    var condition = null, conditionMachine;
    if (tree.condition) {
      if (this.expressionNeedsStateMachine(tree.condition)) {
        tmp = this.expressionToStateMachine(tree.condition);
        condition = tmp.expression;
        conditionMachine = tmp.machine;
      } else {
        condition = this.transformAny(tree.condition);
      }
    }

    var increment = null, incrementMachine;
    if (tree.increment) {
      if (this.expressionNeedsStateMachine(tree.increment)) {
        tmp = this.expressionToStateMachine(tree.increment);
        increment = tmp.expression;
        incrementMachine = tmp.machine;
      } else {
        increment = this.transformAny(tree.increment);
      }
    }

    var body = this.transformAny(tree.body);

    if (initialiser === tree.initialiser && condition === tree.condition &&
        increment === tree.increment && body === tree.body) {
      return tree;
    }

    if (!initialiserMachine && !conditionMachine && !incrementMachine &&
        body.type !== STATE_MACHINE) {
      return new ForStatement(tree.location, initialiser, condition,
          increment, body);
    }

    // a yield within the body of a 'for' statement
    var loopBodyMachine = this.ensureTransformed_(body);
    var bodyFallThroughId = loopBodyMachine.fallThroughState;
    var fallThroughId = this.allocateState();

    var startId;
    var initialiserStartId =
        initialiser ? this.allocateState() : State.INVALID_STATE;
    var conditionStartId =
        increment ? this.allocateState() : bodyFallThroughId;
    var loopStartId = loopBodyMachine.startState;
    var incrementStartId = bodyFallThroughId;

    var states = [];

    if (initialiser) {
      startId = initialiserStartId;
      var initialiserFallThroughId;
      if (condition)
        initialiserFallThroughId = conditionStartId;
      else
        initialiserFallThroughId = loopStartId;

     var tmpId = initialiserStartId;

      if (initialiserMachine) {
        initialiserMachine =
            initialiserMachine.replaceStartState(initialiserStartId);
        tmpId = initialiserMachine.fallThroughState;
        states.push(...initialiserMachine.states);
      }

      states.push(
          new FallThroughState(
              tmpId,
              initialiserFallThroughId,
              createStatementList(
                  createExpressionStatement(initialiser))));
    }

    if (condition) {
      if (!initialiser)
        startId = conditionStartId;

      var tmpId = conditionStartId;

      if (conditionMachine) {
        conditionMachine =
            conditionMachine.replaceStartState(conditionStartId);
        tmpId = conditionMachine.fallThroughState;
        states.push(...conditionMachine.states);
      }

      states.push(
        new ConditionalState(
              tmpId,
              loopStartId,
              fallThroughId,
              condition));
    }

    if (increment) {
      var incrementFallThroughId;
      if (condition)
        incrementFallThroughId = conditionStartId;
      else
        incrementFallThroughId = loopStartId;

      var tmpId = incrementStartId;

      if (incrementMachine) {
        incrementMachine =
            incrementMachine.replaceStartState(incrementStartId);
        tmpId = incrementMachine.fallThroughState;
        states.push(...incrementMachine.states);
      }

      states.push(
          new FallThroughState(
              tmpId,
              incrementFallThroughId,
              createStatementList(
                  createExpressionStatement(increment))));
    }

    // loop body
    if (!initialiser && !condition)
      startId = loopStartId;

    var continueId;
    if (increment)
      continueId = incrementStartId;
    else if (condition)
      continueId = conditionStartId;
    else
      continueId = loopStartId;

    if (!increment && !condition) {
      // If we had either increment or condition, that would take the loop
      // body's fall through ID as its ID. If we have neither we need to change
      // the loop body's fall through ID to loop back to the loop body's start
      // ID.
      loopBodyMachine =
          loopBodyMachine.replaceFallThroughState(loopBodyMachine.startState);
    }

    this.addLoopBodyStates_(loopBodyMachine, continueId, fallThroughId,
                            labels, states);

    var machine = new StateMachine(startId, fallThroughId, states,
                                  loopBodyMachine.exceptionBlocks);

    if (label)
      machine = machine.replaceStateId(continueId, label.continueState);

    return machine;
  }

  /**
   * @param {ForInStatement} tree
   * @return {ParseTree}
   */
  transformForInStatement(tree) {
    // The only for in statement left is from the ForInTransformPass. Just pass
    // it through.
    return tree;
  }

  /**
   * @param {ForOfStatement} tree
   * @return {ParseTree}
   */
  transformForOfStatement(tree) {
    throw new Error(
        'for of statements should be transformed before this pass');
  }

  /**
   * @param {IfStatement} tree
   * @return {ParseTree}
   */
  transformIfStatement(tree) {
    var machine, condition, ifClause, elseClause;

    if (this.expressionNeedsStateMachine(tree.condition)) {
      ({machine, expression: condition} =
          this.expressionToStateMachine(tree.condition));
      ifClause = this.transformAny(tree.ifClause);
      elseClause = this.transformAny(tree.elseClause);
    } else {
      var result = super(tree);
      ({condition, ifClause, elseClause} = result);
      if (ifClause.type !== STATE_MACHINE &&
          (elseClause === null || elseClause.type !== STATE_MACHINE)) {
        return result;
      }
    }

    ifClause = this.ensureTransformed_(ifClause);
    elseClause = this.ensureTransformed_(elseClause);

    var startState = this.allocateState();
    var fallThroughState = ifClause.fallThroughState;
    var ifState = ifClause.startState;
    var elseState =
        elseClause == null ?
            fallThroughState :
            elseClause.startState;

    var states = [];
    var exceptionBlocks = [];

    states.push(
        new ConditionalState(
            startState,
            ifState,
            elseState,
            condition));
    states.push(...ifClause.states);
    exceptionBlocks.push(...ifClause.exceptionBlocks);
    if (elseClause != null) {
      this.replaceAndAddStates_(
          elseClause.states,
          elseClause.fallThroughState,
          fallThroughState,
          states);
      exceptionBlocks.push(
          ...State.replaceAllStates(elseClause.exceptionBlocks,
                                    elseClause.fallThroughState,
                                    fallThroughState));
    }

    var ifMachine = new StateMachine(startState, fallThroughState, states,
                                     exceptionBlocks);
    if (machine)
      ifMachine = machine.append(ifMachine);
    return ifMachine;
  }

  /**
   * @param {Array.<State>} oldStates
   * @return {Array.<State>} An array with empty states removed.
   */
  removeEmptyStates(oldStates) {
    var emptyStates = [], newStates = [];
    // Remove empty FallThroughState states.
    for (var i = 0; i < oldStates.length; i++) {
      if (oldStates[i] instanceof FallThroughState &&
          oldStates[i].statements.length === 0) {
        emptyStates.push(oldStates[i]);
      } else {
        newStates.push(oldStates[i]);
      }
    }
    // Fix up dangling state transitions.
    for (i = 0; i < newStates.length; i++) {
      newStates[i] = emptyStates.reduce((state, {id, fallThroughState}) => {
        return state.replaceState(id, fallThroughState);
      }, newStates[i]);
    }
    return newStates;
  }

  /**
   * @param {Array.<State>} oldStates
   * @param {number} oldState
   * @param {number} newState
   * @param {Array.<State>} newStates
   */
  replaceAndAddStates_(oldStates, oldState, newState, newStates) {
    for (var i = 0; i < oldStates.length; i++) {
      newStates.push(oldStates[i].replaceState(oldState, newState));
    }
  }

  /**
   * @param {LabelledStatement} tree
   * @return {ParseTree}
   */
  transformLabelledStatement(tree) {
    // Any statement can be preceeded by a label. Labels have lexical scope so
    // we keep track of the opened labels and their states.

    // We create an object to hold the state of the currrent label. This is then
    // used directly inside the statement if it is a loop and the loop machines
    // state IDs are updated to use the allocated states below.
    var startState = this.allocateState();
    var continueState = this.allocateState();
    var fallThroughState = this.allocateState();

    var label = new LabelState(tree.name.value, continueState, fallThroughState);
    var oldLabels = this.addLabel_(label);
    this.currentLabel_ = label;

    var result = this.transformAny(tree.statement);
    if (result === tree.statement) {
      result = tree;
    } else if (result.type === STATE_MACHINE) {
      result = result.replaceStartState(startState);
      result = result.replaceFallThroughState(fallThroughState);
    }

    this.restoreLabels_(oldLabels);

    return result;
  }

  getLabels_() {
    return this.labelSet_;
  }

  restoreLabels_(oldLabels) {
    this.labelSet_ = oldLabels;
  }

  /**
   * Adds a label to the current label set. Returns the OLD label set.
   * @param {LabelState} label
   * @return {Object}
   */
  addLabel_(label) {
    var oldLabels = this.labelSet_;

    var labelSet = Object.create(null);
    for (var k in this.labelSet_) {
      labelSet[k] = this.labelSet_[k];
    }
    labelSet[label.name] = label;
    this.labelSet_ = labelSet;

    return oldLabels;
  }

  clearLabels_() {
    var result = this.labelSet_;
    this.labelSet_ = Object.create(null);
    return result;
  }

  clearCurrentLabel_() {
    var result = this.currentLabel_;
    this.currentLabel_ = null;
    return result;
  }

  /**
   * @param {SwitchStatement} tree
   * @return {ParseTree}
   */
  transformSwitchStatement(tree) {
    var labels = this.getLabels_();

    var expression, machine, caseClauses;
    if (this.expressionNeedsStateMachine(tree.expression)) {
      ({expression, machine} = this.expressionToStateMachine(tree.expression));
      caseClauses = this.transformList(tree.caseClauses);
    } else {
      var result = super.transformSwitchStatement(tree);
      if (!needsStateMachine(result))
        return result;
      ({expression, caseClauses} = result);
    }

    // a yield within a switch statement
    var startState = this.allocateState();
    var fallThroughState = this.allocateState();
    var nextState = fallThroughState;
    var states = [];
    var clauses = [];
    var tryStates = [];
    var hasDefault = false;

    for (var index = caseClauses.length - 1; index >= 0; index--) {
      var clause = caseClauses[index];
      if (clause.type == CASE_CLAUSE) {
        var caseClause = clause;
        nextState =
            this.addSwitchClauseStates_(nextState, fallThroughState, labels,
                                        caseClause.statements, states,
                                        tryStates);
        clauses.push(new SwitchClause(caseClause.expression, nextState));
      } else {
        hasDefault = true;
        var defaultClause = clause;
        nextState =
            this.addSwitchClauseStates_(nextState, fallThroughState, labels,
                                        defaultClause.statements, states,
                                        tryStates);
        clauses.push(new SwitchClause(null, nextState));
      }
    }
    if (!hasDefault) {
      clauses.push(new SwitchClause(null, fallThroughState));
    }
    states.push(
        new SwitchState(startState, expression, clauses.reverse()));

    var switchMachine = new StateMachine(startState, fallThroughState,
        states.reverse(), tryStates);
    if (machine)
      switchMachine = machine.append(switchMachine);
    return switchMachine;
  }

  /**
   * @param {number} nextState
   * @param {number} fallThroughState
   * @param {Object} labels
   * @param {Array.<ParseTree>} statements
   * @param {Array.<ParseTree>} states
   * @param {Array.<TryState>} tryStates
   * @return {number}
   */
  addSwitchClauseStates_(nextState, fallThroughState, labels,
                         statements, states, tryStates) {
    var machine = this.ensureTransformedList_(statements);
    for (var i = 0; i < machine.states.length; i++) {
      var state = machine.states[i];
      var transformedState = state.transformBreak(labels, fallThroughState);
      states.push(
          transformedState.replaceState(machine.fallThroughState, nextState));
    }
    tryStates.push(...machine.exceptionBlocks);
    return machine.startState;
  }

  /**
   * @param {TryStatement} tree
   * @return {ParseTree}
   */
  transformTryStatement(tree) {
    var result = super.transformTryStatement(tree);
    var {body, catchBlock, finallyBlock} = result;
    if (body.type != STATE_MACHINE &&
        (catchBlock == null || catchBlock.catchBody.type != STATE_MACHINE) &&
        (finallyBlock == null || finallyBlock.block.type != STATE_MACHINE)) {
      return result;
    }

    // We inject a pushTry at the beginning of the try block and popTry at the
    // end as well as popTry at the beginning of catch and finally.
    //
    // We end up with something like this:
    //
    // try {
    //   pushTry(catchState, finallyState);
    //   ...
    //   popTry()
    // } catch (ex) {
    //   popTry();
    //   ...
    // } finally {
    //   popTry();
    //   ...
    // }
    var outerCatchState = this.allocateState();
    var outerFinallyState = this.allocateState();

    var pushTryState = this.statementToStateMachine_(
        parseStatement `$ctx.pushTry(
            ${catchBlock && outerCatchState},
            ${finallyBlock && outerFinallyState});`);

    var tryMachine = this.ensureTransformed_(body);
    tryMachine = pushTryState.append(tryMachine);

    if (catchBlock !== null) {
      var popTry = this.statementToStateMachine_(
          parseStatement `$ctx.popTry();`);
      tryMachine = tryMachine.append(popTry);

      var exceptionName = catchBlock.binding.identifierToken.value;
      var catchMachine = this.ensureTransformed_(catchBlock.catchBody);
      var catchStart = this.allocateState();

      this.addMachineVariable(exceptionName);

      var states = [
        ...tryMachine.states,
        new FallThroughState(
            catchStart,
            catchMachine.startState,
            parseStatements `
              $ctx.popTry();
              ${id(exceptionName)} = $ctx.storedException;`)
      ];
      this.replaceAndAddStates_(
          catchMachine.states,
          catchMachine.fallThroughState,
          tryMachine.fallThroughState,
          states);

      tryMachine = new StateMachine(
          tryMachine.startState,
          tryMachine.fallThroughState,
          states,
          [new CatchState(
              exceptionName,
              catchStart,
              tryMachine.fallThroughState,
              tryMachine.getAllStateIDs(),
              tryMachine.exceptionBlocks)]);

      tryMachine = tryMachine.replaceStateId(catchStart, outerCatchState);
    }

    if (finallyBlock != null) {
      var finallyMachine = this.ensureTransformed_(finallyBlock.block);

      var popTry = this.statementToStateMachine_(
          parseStatement `$ctx.popTry();`);
      finallyMachine = popTry.append(finallyMachine);

      var states = [
        ...tryMachine.states,
        ...finallyMachine.states,
        new FinallyFallThroughState(finallyMachine.fallThroughState)
      ];

      // NOTE: finallyMachine.fallThroughState == FinallyState.fallThroughState
      // is code generated in addFinallyFallThroughDispatches
      tryMachine = new StateMachine(
          tryMachine.startState,
          tryMachine.fallThroughState,
          states,
          [new FinallyState(
              finallyMachine.startState,
              finallyMachine.fallThroughState,
              tryMachine.getAllStateIDs(),
              tryMachine.exceptionBlocks)]);

      tryMachine = tryMachine.replaceStateId(finallyMachine.startState,
                                             outerFinallyState);
    }

    return tryMachine;
  }

  /**
   * @param {WhileStatement} tree
   * @return {ParseTree}
   */
  transformWhileStatement(tree) {
    var labels = this.getLabels_();
    var label = this.clearCurrentLabel_();

    var condition, machine, body;
    if (this.expressionNeedsStateMachine(tree.condition)) {
      ({machine, expression: condition} =
          this.expressionToStateMachine(tree.condition));
      body = this.transformAny(tree.body);
    } else {
      var result = super.transformWhileStatement(tree);
      ({condition,body} = result);
      if (body.type !== STATE_MACHINE)
        return result;
    }


    // a yield within a while loop
    var loopBodyMachine = this.ensureTransformed_(body);
    var startState = loopBodyMachine.fallThroughState;
    var fallThroughState = this.allocateState();

    var states = [];
    var conditionStart = startState;
    if (machine) {
      machine = machine.replaceStartState(startState);
      conditionStart = machine.fallThroughState;

      // An expression cannot generate exceptionBlocks.
      states.push(...machine.states);
    }

    states.push(
        new ConditionalState(
            conditionStart,
            loopBodyMachine.startState,
            fallThroughState,
            condition));

    this.addLoopBodyStates_(loopBodyMachine, startState, fallThroughState,
                            labels, states);

    var machine = new StateMachine(startState, fallThroughState, states,
                                   loopBodyMachine.exceptionBlocks);

    if (label)
      machine = machine.replaceStateId(startState, label.continueState);

    return machine;
  }

  /**
   * @param {WithStatement} tree
   * @return {ParseTree}
   */
  transformWithStatement(tree) {
    var result = super.transformWithStatement(tree);
    if (result.body.type != STATE_MACHINE) {
      return result;
    }
    throw new Error(
        'Unreachable - with statement not allowed in strict mode/harmony');
  }

  generateMachineInnerFunction(machine) {
    var enclosingFinallyState = machine.getEnclosingFinallyMap();

    var SwitchStatement = createSwitchStatement(
        createMemberExpression('$ctx', 'state'),
        this.transformMachineStates(
            machine,
            State.END_STATE,
            State.RETHROW_STATE,
            enclosingFinallyState));

    return parseExpression `function($ctx) {
      while (true) ${SwitchStatement}
    }`;
  }

  addTempVar() {
    var name = this.getTempIdentifier();
    this.addMachineVariable(name);
    return name;
  }

  addMachineVariable(name) {
    this.hoistVariablesTransformer_.addVariable(name);
  }

  transformCpsFunctionBody(tree, runtimeMethod) {
    var alphaRenamedTree = AlphaRenamer.rename(tree, 'arguments', '$arguments');
    var hasArguments = alphaRenamedTree !== tree;

    // We hoist all the variables. They are not even inserted at the top in this
    // call but added later, since we use the same set of variable names for the
    // machine generated variables.
    var hoistedTree =
        this.hoistVariablesTransformer_.transformAny(alphaRenamedTree);

    // transform to a state machine
    var maybeMachine = this.transformAny(hoistedTree);
    if (this.reporter.hadError())
      return tree;

    // If the FunctionBody has no yield or return, no state machine got created
    // in the above transformation. We therefore convert it below.
    var machine;
    if (maybeMachine.type !== STATE_MACHINE) {
      machine = this.statementsToStateMachine_(maybeMachine.statements);
    } else {
      // Remove possibly empty states.
      machine = new StateMachine(maybeMachine.startState,
                                 maybeMachine.fallThroughState,
                                 this.removeEmptyStates(maybeMachine.states),
                                 maybeMachine.exceptionBlocks);
    }

    // Clean up start and end states.
    machine = machine.
        replaceFallThroughState(State.END_STATE).
        replaceStartState(State.START_STATE);

    var statements = [];
    if (this.hoistVariablesTransformer_.hasVariables())
      statements.push(this.hoistVariablesTransformer_.getVariableStatement());
    if (hasArguments)
      statements.push(parseStatement `var $arguments = arguments;`);
    statements.push(parseStatement
        `return ${runtimeMethod}(
            ${this.generateMachineInnerFunction(machine)},
            this);`);

    // TODO(arv): The result should be an instance of Generator.
    // https://code.google.com/p/traceur-compiler/issues/detail?id=109

    return createFunctionBody(statements);
  }

  /**
   * @param {FunctionDeclaration} tree
   * @return {ParseTree}
   */
  transformFunctionDeclaration(tree) {
    // nested functions have already been transformed
    return tree;
  }

  /**
   * @param {FunctionExpression} tree
   * @return {ParseTree}
   */
  transformFunctionExpression(tree) {
    // nested functions have already been transformed
    return tree;
  }

  /**
   * @param {GetAccessor} tree
   * @return {ParseTree}
   */
  transformGetAccessor(tree) {
    // nested functions have already been transformed
    return tree;
  }

  /**
   * @param {SetAccessor} tree
   * @return {ParseTree}
   */
  transformSetAccessor(tree) {
    // nested functions have already been transformed
    return tree;
  }

  /**
   * @param {StateMachine} tree
   * @return {ParseTree}
   */
  transformStateMachine(tree) {
    return tree;
  }

  /**
   * Converts a statement into a state machine. The statement may not contain a
   * yield statement directly or indirectly.
   * @param {ParseTree} statements
   * @return {StateMachine}
   */
  statementToStateMachine_(statement) {
    var statements;
    if (statement.type === BLOCK)
      statements = statement.statements;
    else
      statements = [statement];
    return this.statementsToStateMachine_(statements);
  }

  /**
   * Converts a list of statements into a state machine. The statements may not
   * contain a yield statement directly or indirectly.
   * @param {Array.<ParseTree>} statements
   * @return {StateMachine}
   */
  statementsToStateMachine_(statements) {
    var startState = this.allocateState();
    var fallThroughState = this.allocateState();
    return this.stateToStateMachine_(
        new FallThroughState(
            startState,
            fallThroughState,
            statements),
        fallThroughState);
  }

  /**
   * @param {State} newState
   * @param {number} fallThroughState
   * @return {StateMachibneTree}
   */
  stateToStateMachine_(newState, fallThroughState) {
    return new StateMachine(newState.id, fallThroughState, [newState], []);
  }

  /**
   * Transforms all the machine states into a list of case clauses. Adds a
   * rethrow clause if the machine has any try blocks. Also adds a 'default'
   * clause which indicates a compiler bug in the state machine generation.
   * @param {StateMachine} machine
   * @param {number} machineEndState
   * @param {number} rethrowState
   * @param {Object} enclosingFinallyState
   * @return {Array.<ParseTree>}
   */
  transformMachineStates(machine, machineEndState, rethrowState,
                         enclosingFinallyState) {

    var cases = [];

    for (var i = 0; i < machine.states.length; i++) {
      var state = machine.states[i];
      var stateCase = state.transformMachineState(
          enclosingFinallyState[state.id],
          machineEndState, this.reporter);
      if (stateCase != null) {
        cases.push(stateCase);
      }
    }

    // add finally fallthrough dispatch states
    this.addFinallyFallThroughDispatches(null, machine.exceptionBlocks, cases);

    cases.push(createDefaultClause(parseStatements `return $ctx.end()`));

    return cases;
  }

  /**
   * @param {FinallyState} enclosingFinallyState
   * @param {Array.<TryState>} tryStates
   * @param {Array.<ParseTree>} cases
   */
  addFinallyFallThroughDispatches(enclosingFinallyState, tryStates, cases) {
    for (var i = 0; i < tryStates.length; i++) {
      var tryState = tryStates[i];
      if (tryState.kind == TryState.Kind.FINALLY) {
        var finallyState = tryState;

        if (enclosingFinallyState != null) {
          var caseClauses = [];
          var index = 0;
          // CONSIDER: the actual list is much less than
          // enclosingFinallyState.tryStates
          // CONSIDER: it is actually only jump destinations plus catch starts
          for (var j = 0; j < enclosingFinallyState.tryStates.length; j++) {
            var destination = enclosingFinallyState.tryStates[j];
            index++;
            var statements;
            // all but the last case fallthrough to the last case clause
            if (index < enclosingFinallyState.tryStates.length) {
              statements = createStatementList();
            } else {
              statements = parseStatements `
                  $ctx.state = $ctx.finallyFallThrough;
                  $ctx.finallyFallThrough = ${State.INVALID_STATE};
                  break;`
            }
            caseClauses.push(
                createCaseClause(createNumberLiteral(destination), statements));
          }
          caseClauses.push(
              createDefaultClause(
                  createStatementList(
                      // $ctx.state = enclosingFinallyState.startState;
                      createAssignStateStatement(
                          enclosingFinallyState.finallyState),
                      // break;
                      createBreakStatement())));

          // case finally.fallThroughState:
          //   switch ($fallThrough) {
          //   case enclosingFinally.tryStates:
          //   ...
          //     $ctx.state = $fallThrough;
          //     $fallThrough = INVALID_STATE;
          //     break;
          //   default:
          //     $ctx.state = enclosingFinallyBlock.startState;
          //     break;
          //   }
          //   break;
          cases.push(
              createCaseClause(
                  createNumberLiteral(finallyState.fallThroughState),
                  createStatementList(
                      createSwitchStatement(
                          createMemberExpression('$ctx', 'finallyFallThrough'),
                          caseClauses),
                      createBreakStatement())));
        } else {
          // case finally.fallThroughState:
          //   $ctx.state = $fallThrough;
          //   break;
          cases.push(
              createCaseClause(
                  createNumberLiteral(finallyState.fallThroughState),
                  parseStatements `
                      $ctx.state = $ctx.finallyFallThrough;
                      break;`));
        }
        this.addFinallyFallThroughDispatches(finallyState,
                                             finallyState.nestedTrys,
                                             cases);
      } else {
        this.addFinallyFallThroughDispatches(enclosingFinallyState,
                                             tryState.nestedTrys,
                                             cases);
      }
    }
  }

  transformVariableDeclarationList(tree) {
    // The only declarations left are const/let.
    this.reporter.reportError(
        tree.location && tree.location.start,
        'Traceur: const/let declarations in a block containing a yield are ' +
        'not yet implemented');
    return tree;
  }

  /**
   * transforms break/continue statements and their parents to state machines
   * @param {ParseTree} maybeTransformedStatement
   * @return {ParseTree}
   */
  maybeTransformStatement_(maybeTransformedStatement) {
    // transform break/continue statements and their parents to state machines
    var breakContinueTransformed =
        new BreakContinueTransformer(this.stateAllocator_).
            transformAny(maybeTransformedStatement);
    if (breakContinueTransformed != maybeTransformedStatement) {
      breakContinueTransformed = this.transformAny(breakContinueTransformed);
    }
    return breakContinueTransformed;
  }

  /**
   * Ensure that a statement has been transformed into a state machine.
   * @param {ParseTree} statement
   * @return {StateMachine}
   */
  ensureTransformed_(statement) {
    if (statement == null) {
      return null;
    }
    var maybeTransformed = this.maybeTransformStatement_(statement);
    return maybeTransformed.type == STATE_MACHINE ?
        maybeTransformed :
        this.statementToStateMachine_(maybeTransformed);
  }

  /**
   * Ensure that a statement has been transformed into a state machine.
   * @param {Array.<ParseTree>} statements
   * @return {StateMachine}
   */
  ensureTransformedList_(statements) {
    var maybeTransformedStatements = [];
    var foundMachine = false;
    for (var i = 0; i < statements.length; i++) {
      var statement = statements[i];
      var maybeTransformedStatement = this.maybeTransformStatement_(statement);
      maybeTransformedStatements.push(maybeTransformedStatement);
      if (maybeTransformedStatement.type == STATE_MACHINE) {
        foundMachine = true;
      }
    }
    if (!foundMachine) {
      return this.statementsToStateMachine_(statements);
    }

    return this.transformStatementList_(maybeTransformedStatements);
  }

  expressionToStateMachine(tree) {
    var commaExpression = new ExplodeExpressionTransformer(this).
        transformAny(tree);
    var {statements} = new NormalizeCommaExpressionToStatementTransformer().
        transformAny(commaExpression);

    var lastStatement = statements.pop();
    assert(lastStatement.type === EXPRESSION_STATEMENT);
    var expression = lastStatement.expression;

    statements = super.transformList(statements);
    var machine = this.transformStatementList_(statements);

    return {expression, machine};
  }
}

/**
 * Transformer for transforming a normalized comma expression as returned by the
 * ExplodeExpressionTransformer into a set of expression statements and if
 * statements.
 */
class NormalizeCommaExpressionToStatementTransformer extends
    ParseTreeTransformer {

  transformCommaExpression(tree) {
    var statements = tree.expressions.map((expr) => {
      if (expr.type === CONDITIONAL_EXPRESSION)
        return this.transformAny(expr);
      return createExpressionStatement(expr);
    });
    return new AnonBlock(tree.location, statements);
  }

  transformConditionalExpression(tree) {
    // a ? b : c
    // =>
    // $0 = a, $0 ? ($1 = b, $2 = $1) : ($3 = c, $2 = $3), $2
    // =>
    // $0 = a;
    // if ($0) {
    //   $1 = b;
    //   $2 = $1;
    // } else {
    //  $3 = c;
    //  $2 = $3;
    // }
    // $2
    var ifBlock = this.transformAny(tree.left);
    var elseBlock = this.transformAny(tree.right);
    return new IfStatement(tree.location, tree.condition,
        anonBlockToBlock(ifBlock), anonBlockToBlock(elseBlock));
  }
}

function anonBlockToBlock(tree) {
  if (tree.type === PAREN_EXPRESSION)
    return anonBlockToBlock(tree.expression);
  return new Block(tree.location, tree.statements);
}
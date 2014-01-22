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

import {BreakContinueTransformer} from './BreakContinueTransformer';
import {
  BREAK_STATEMENT,
  CASE_CLAUSE,
  CONTINUE_STATEMENT,
  STATE_MACHINE,
  VARIABLE_DECLARATION_LIST,
  VARIABLE_STATEMENT
} from '../../syntax/trees/ParseTreeType';
import {
  CaseClause,
  IdentifierExpression,
  SwitchStatement
} from '../../syntax/trees/ParseTrees';
import {CatchState} from './CatchState';
import {ConditionalState} from './ConditionalState';
import {FallThroughState} from './FallThroughState';
import {FinallyFallThroughState} from './FinallyFallThroughState';
import {FinallyState} from './FinallyState';
import {IdentifierToken} from '../../syntax/IdentifierToken';
import {ParseTreeTransformer} from '../ParseTreeTransformer';
import {assert} from '../../util/assert';
import {
  parseExpression,
  parseStatement,
  parseStatements
} from '../PlaceholderParser';
import {
  $ARGUMENTS,
  $THAT,
  ARGUMENTS,
  CAUGHT_EXCEPTION
} from '../../syntax/PredefinedName';
import {State} from './State';
import {StateAllocator} from './StateAllocator';
import {StateMachine} from '../../syntax/trees/StateMachine';
import {
  SwitchClause,
  SwitchState
} from './SwitchState';
import {
  PLUS,
  VAR
} from '../../syntax/TokenType';
import {TryState} from './TryState';
import {
  createAssignStateStatement,
  createAssignmentExpression,
  createAssignmentStatement,
  createBinaryOperator,
  createBreakStatement,
  createCaseClause,
  createCommaExpression,
  createDefaultClause,
  createEmptyStatement,
  createExpressionStatement,
  createIdentifierExpression,
  createMemberExpression,
  createNumberLiteral,
  createOperatorToken,
  createStatementList,
  createStringLiteral,
  createSwitchStatement,
  createThrowStatement,
  createTrueLiteral,
  createVariableStatement,
  createWhileStatement
} from '../ParseTreeFactory';
import {variablesInBlock} from '../../semantics/VariableBinder';

var id = createIdentifierExpression;

// TODO(arv): Move to a shared file?
var ST_CLOSED = 3;

class LabelState {
  constructor(name, continueState, fallThroughState) {
    this.name = name;
    this.continueState = continueState;
    this.fallThroughState = fallThroughState;
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
export class CPSTransformer extends ParseTreeTransformer {
  /**
   * @param {ErrorReporter} reporter
   */
  constructor(reporter) {
    super();
    this.reporter = reporter;
    this.stateAllocator_ = new StateAllocator();
    this.labelSet_ = Object.create(null);
    this.currentLabel_ = null;
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
    // NOTE: tree may contain state machines already ...
    var transformedTree = super.transformBlock(tree);
    var machine = this.transformStatementList_(transformedTree.statements);
    return machine == null ? transformedTree : machine;
  }

  transformFunctionBody(tree) {
    // NOTE: tree may contain state machines already ...
    var oldLabels = this.clearLabels_();

    var transformedTree = super.transformFunctionBody(tree);
    var machine = this.transformStatementList_(transformedTree.statements);

    this.restoreLabels_(oldLabels);

    if (machine) {
      machine = simplifyMachine(machine);
    }

    return machine == null ? transformedTree : machine;
  }

  /**
   * @param {Array.<ParseTree>} someTransformed
   * @return {StateMachine}
   */
  transformStatementList_(someTransformed) {
    // This block has undergone some transformation but may only be variable
    // transforms. We only need to return a state machine if the block contains
    // a yield which has been converted to a state machine or contains a break
    // or continue.
    if (!this.needsStateMachine_(someTransformed)) {
      return null;
    }

    // this block contains at least 1 yield statement which has been
    // transformed into a StateMachine. Transform all remaining statements into
    // StateMachines then sequence them together.
    var currentMachine = this.ensureTransformed_(someTransformed[0]);
    for (var index = 1; index < someTransformed.length; index++) {
      currentMachine = currentMachine.append(
          this.ensureTransformed_(someTransformed[index]));
    }

    return currentMachine;
  }

  /**
   * @param {Array.<ParseTree>|SwitchStatement} statements
   * @return {boolean}
   */
  needsStateMachine_(statements) {
    if (statements instanceof Array) {
      for (var i = 0; i < statements.length; i++) {
        switch (statements[i].type) {
          case STATE_MACHINE:
            return true;
          case BREAK_STATEMENT:
          case CONTINUE_STATEMENT:
            if (statements[i].name)
              return true;
            break;
        }
      }
      return false;
    }

    assert(statements instanceof SwitchStatement);
    for (var i = 0; i < statements.caseClauses.length; i++) {
      var clause = statements.caseClauses[i];
      if (this.needsStateMachine_(clause.statements)) {
        return true;
      }
    }
    return false;
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

    var result = super.transformDoWhileStatement(tree);
    if (result.body.type != STATE_MACHINE)
      return result;

    // a yield within a do/while loop
    var loopBodyMachine = result.body;
    var startState = loopBodyMachine.startState;
    var conditionState = loopBodyMachine.fallThroughState;
    var fallThroughState = this.allocateState();

    var states = [];

    this.addLoopBodyStates_(loopBodyMachine, conditionState, fallThroughState,
                            labels, states);
    states.push(
        new ConditionalState(
            conditionState,
            startState,
            fallThroughState,
            result.condition));

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

    var result = super.transformForStatement(tree);
    if (result.body.type != STATE_MACHINE)
      return result;

    // a yield within the body of a 'for' statement
    var loopBodyMachine = result.body;

    var incrementState = loopBodyMachine.fallThroughState;
    var conditionState =
        result.increment == null && result.condition != null ?
            incrementState :
            this.allocateState();
    var startState =
        result.initialiser == null ?
            (result.condition == null ?
                loopBodyMachine.startState : conditionState) :
            this.allocateState();
    var fallThroughState = this.allocateState();

    var states = [];
    if (result.initialiser != null) {
      states.push(
          new FallThroughState(
              startState,
              conditionState,
              createStatementList(
                  createExpressionStatement(result.initialiser))));
    }
    if (result.condition != null) {
      states.push(
          new ConditionalState(
              conditionState,
              loopBodyMachine.startState,
              fallThroughState,
              result.condition));
    } else {
      // alternative is to renumber the loopBodyMachine.fallThrough to
      // loopBodyMachine.start
      states.push(
          new FallThroughState(
              conditionState,
              loopBodyMachine.startState,
              createStatementList()));
    }
    if (result.increment != null) {
      states.push(
          new FallThroughState(
              incrementState,
              conditionState,
              createStatementList(
                  createExpressionStatement(result.increment))));
    }

    this.addLoopBodyStates_(loopBodyMachine, incrementState, fallThroughState,
                            labels, states);

    var machine = new StateMachine(startState, fallThroughState, states,
                                  loopBodyMachine.exceptionBlocks);

    if (label)
      machine = machine.replaceStateId(incrementState, label.continueState);

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
    var result = super.transformIfStatement(tree);
    if (result.ifClause.type != STATE_MACHINE &&
        (result.elseClause == null ||
         result.elseClause.type != STATE_MACHINE)) {
      return result;
    }

    // if containing a yield
    var ifClause = this.ensureTransformed_(result.ifClause);
    var elseClause = this.ensureTransformed_(result.elseClause);

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
            result.condition));
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


    return new StateMachine(startState, fallThroughState, states,
                            exceptionBlocks);
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
      result = result.replaceStateId(result.startState, startState);
      result = result.replaceStateId(result.fallThroughState, fallThroughState);
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

    var result = super.transformSwitchStatement(tree);
    if (!this.needsStateMachine_(result))
      return result;

    // a yield within a switch statement
    var startState = this.allocateState();
    var fallThroughState = this.allocateState();
    var nextState = fallThroughState;
    var states = [];
    var clauses = [];
    var tryStates = [];
    var hasDefault = false;

    for (var index = result.caseClauses.length - 1; index >= 0; index--) {
      var clause = result.caseClauses[index];
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
        new SwitchState(startState, result.expression, clauses.reverse()));

    return new StateMachine(startState, fallThroughState, states.reverse(),
                            tryStates);
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
    if (result.body.type != STATE_MACHINE &&
        (result.catchBlock == null ||
         result.catchBlock.catchBody.type != STATE_MACHINE)) {
      return result;
    }
    // NOTE: yield inside finally caught in FinallyBlock transform methods

    var outerCatchState = this.allocateState();
    var outerFinallyState = this.allocateState();
    var outerFinallyFallThroughState = this.allocateState()

    var pushTryState = this.statementToStateMachine_(
        parseStatement `$ctx.pushTry(
            ${result.catchBlock && outerCatchState},
            ${result.finallyBlock && outerFinallyState},
            ${outerFinallyFallThroughState});`);

    var tryMachine = this.ensureTransformed_(result.body);
    tryMachine = pushTryState.append(tryMachine);

    if (result.catchBlock !== null) {
      var popCatchState = this.statementToStateMachine_(
          parseStatement `$ctx.popCatch();`);
      tryMachine = tryMachine.append(popCatchState);
    }

    if (result.catchBlock != null) {
      var catchBlock = result.catchBlock;
      var exceptionName = catchBlock.binding.identifierToken.value;
      var catchMachine =
          this.ensureTransformed_(catchBlock.catchBody);
      var startState = tryMachine.startState;
      var fallThroughState = tryMachine.fallThroughState;

      var catchStart = this.allocateState();

      var states = [
        ...tryMachine.states,
        new FallThroughState(
            catchStart,
            catchMachine.startState,
            parseStatements `
              $ctx.popCatch();
              ${id(exceptionName)} = $ctx.storedException;`)
      ];
      this.replaceAndAddStates_(
          catchMachine.states,
          catchMachine.fallThroughState,
          fallThroughState,
          states);

      tryMachine = new StateMachine(
          tryMachine.startState,
          tryMachine.fallThroughState,
          states,
          [new CatchState(
              exceptionName,
              catchStart,
              fallThroughState,
              tryMachine.getAllStateIDs(),
              tryMachine.exceptionBlocks)]);

      tryMachine = tryMachine.replaceStateId(catchStart, outerCatchState);
    }
    if (result.finallyBlock != null) {
      var finallyBlock = result.finallyBlock;
      var finallyMachine =
          this.ensureTransformed_(finallyBlock.block);
      var startState = tryMachine.startState;
      var fallThroughState = tryMachine.fallThroughState;

      var popFinallyState = this.statementToStateMachine_(
          parseStatement `$ctx.popFinally();`);
      finallyMachine = popFinallyState.append(finallyMachine);

      var states = [
        ...tryMachine.states,
        ...finallyMachine.states,
        new FinallyFallThroughState(finallyMachine.fallThroughState)
      ];

      // NOTE: finallyMachine.fallThroughState == FinallyState.fallThroughState
      // is code generated
      // NOTE: in addFinallyFallThroughDispatches
      tryMachine = new StateMachine(
          startState,
          fallThroughState,
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
   * Local variables are lifted out of moveNext to the enclosing function in
   * the generated code.  Because of this there's no good way to codegen block
   * scoped let/const variables where there is a yield in the scope of the
   * block scoped variable.
   *
   * @param {VariableStatement} tree
   * @return {ParseTree}
   */
  transformVariableStatement(tree) {
    var declarations = this.transformVariableDeclarationList(tree.declarations);
    if (declarations == tree.declarations) {
      return tree;
    }
    if (declarations == null) {
      return createEmptyStatement();
    }
    if (declarations.type == VARIABLE_DECLARATION_LIST) {
      // let/const - just transform for now
      return createVariableStatement(declarations);
    }
    return createExpressionStatement(declarations);
  }

  /**
   * This is the initialiser of a for loop. Convert into an expression
   * containing the initialisers.
   *
   * @param {VariableDeclarationList} tree
   * @return {ParseTree}
   */
  transformVariableDeclarationList(tree) {
    if (tree.declarationType == VAR) {
      var expressions = [];
      for (var i = 0; i < tree.declarations.length; i++) {
        var declaration = tree.declarations[i];
        if (declaration.initialiser != null) {
          expressions.push(
              createAssignmentExpression(
                  createIdentifierExpression(
                      this.transformAny(declaration.lvalue)),
                  this.transformAny(declaration.initialiser)));
        }
      }
      var list = expressions;
      if (list.length == 0) {
        return null;
      } else if (list.length == 1) {
        return list[0];
      } else {
        return createCommaExpression(expressions);
      }
    }
    // let/const - just transform for now
    return super.transformVariableDeclarationList(tree);
  }

  /**
   * @param {WhileStatement} tree
   * @return {ParseTree}
   */
  transformWhileStatement(tree) {
    var labels = this.getLabels_();
    var label = this.clearCurrentLabel_();

    var result = super.transformWhileStatement(tree);
    if (result.body.type != STATE_MACHINE)
      return result;

    // a yield within a while loop
    var loopBodyMachine = result.body;
    var startState = loopBodyMachine.fallThroughState;
    var fallThroughState = this.allocateState();

    var states = [];

    states.push(
        new ConditionalState(
            startState,
            loopBodyMachine.startState,
            fallThroughState,
            result.condition));

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

  /**
   * @param {ThisExpression} tree
   * @return {ParseTree}
   */
  transformThisExpression(tree) {
    return new IdentifierExpression(
        tree.location,
        new IdentifierToken(tree.location, $THAT));
  }

  transformIdentifierExpression(tree) {
    if (tree.identifierToken.value === ARGUMENTS) {
      return new IdentifierExpression(
          tree.location,
          new IdentifierToken(tree.location, $ARGUMENTS));
    }
    return tree;
  }

  // With this to $that and arguments to $arguments alpha renaming
  //     function($ctx) {
  //       while (true) {
  //         try {
  //           return this.innerFunction($ctx);
  //         } catch ($caughtException) {
  //           $ctx.storedException = $caughtException;
  //           switch ($ctx.state) {
  //           case enclosing_finally:
  //             $ctx.state = finally.startState;
  //             $fallThrough = rethrow;
  //             break;
  //           case enclosing_catch:
  //             $ctx.state = catch.startState;
  //             break;
  //           case enclosing_catch_around_finally:
  //             $ctx.state = finally.startState;
  //             $fallThrough = catch.startState;
  //             break;
  //           default:
  //             throw $ctx.storedException;
  //           }
  //         }
  //       }
  //     }
  /**
   * @param {StateMachine} machine
   * @return {CallExpression}
   */
  generateMachineMethod(machine) {
    return parseExpression `function($ctx) {
      while (true) {
        ${this.generateMachine(machine)}
      }
    }`;
  }

  generateMachineInnerFunction(machine) {
    var enclosingFinallyState = machine.getEnclosingFinallyMap();
    var enclosingCatchState = machine.getEnclosingCatchMap();
    var rethrowState = this.allocateState();
    var machineEndState = this.allocateState();

    // while (true) {
    //   switch ($ctx.state) {
    //     ... converted states
    //   case rethrow:
    //     throw $ctx.storedException;
    //   }
    // }
    var body =
        createWhileStatement(
            createTrueLiteral(),
            createSwitchStatement(
                createMemberExpression('$ctx', 'state'),
                this.transformMachineStates(
                    machine,
                    State.END_STATE,
                    State.RETHROW_STATE,
                    enclosingFinallyState)));

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

  /**
   * @param {StateMachine} machine
   * @return {ParseTree}
   */
  generateMachine(machine) {
    var catchStatements;

    if (machine.hasExceptionBlocks()) {
      var enclosingFinallyState = machine.getEnclosingFinallyMap();
      var enclosingCatchState = machine.getEnclosingCatchMap();

      var caseClauses = [];
      this.addExceptionCases_(State.RETHROW_STATE, enclosingFinallyState,
                              enclosingCatchState, machine.states,
                              caseClauses);
      //   default:
      //     throw $ctx.storedException;
      caseClauses.push(
          createDefaultClause(
              this.machineUncaughtExceptionStatements(State.RETHROW_STATE,
                                                      State.END_STATE)));

      var switchStatement =
          createSwitchStatement(
              createMemberExpression('$ctx', 'state'),
              caseClauses);

      catchStatements = parseStatements `
          $ctx.storedException = ex;
          ${switchStatement}`;

    } else {
      catchStatements = parseStatements `
          $ctx.GState = ${ST_CLOSED};
          $ctx.state = ${State.END_STATE};
          throw ex;`
    }

    return parseStatement `try {
      return innerFunction($ctx);
    } catch (ex) {
      ${catchStatements}
    }`;
  }

  //   var $ctx.state = machine.startState;
  //   ... lifted local variables ...
  //   ... caught exception variables ...
  /**
   * @param {Block} tree
   * @param {StateMachine} machine
   * @return {Array.<ParseTree>}
   */
  getMachineVariables(tree, machine) {

    var statements = [];

    // Lift locals ...
    var liftedIdentifiers = variablesInBlock(tree, true);

    // ... and caught exceptions
    // TODO: This changes the scope of caught exception variables from 'let' to
    // 'var'. Fix this once we have 'let' bindings in V8.
    var allCatchStates = machine.allCatchStates();
    for (var i = 0; i < allCatchStates.length; i++) {
      liftedIdentifiers[allCatchStates[i].identifier] = true;
    }

    // Sort identifiers to produce a stable output order
    var liftedIdentifierList = Object.keys(liftedIdentifiers).sort();
    for (var i = 0; i < liftedIdentifierList.length; i++) {
      var liftedIdentifier = liftedIdentifierList[i];
      statements.push(
          createVariableStatement(VAR, liftedIdentifier, null));
    }

    return statements;
  }

  /**
   * @param {number} rethrowState
   * @param {Object} enclosingFinallyState
   * @param {Object} enclosingCatchState
   * @param {Array.<State>} allStates
   * @param {Array.<number>} caseClauses
   */
  addExceptionCases_(rethrowState, enclosingFinallyState,
                     enclosingCatchState, allStates, caseClauses) {
    for (var i = 0; i < allStates.length; i++) {
      var state = allStates[i].id;
      var statements = allStates[i].statements;
      var finallyState = enclosingFinallyState[state];
      var catchState = enclosingCatchState[state];

      // We don't need to add a case clause for the current state if it doesn't
      // contain any statements, since that definitely won't throw. Due to the
      // possibility of global getters and setters, however, just about
      // anything else has the potential to throw.
      if (!statements || statements.length === 0)
        continue;

      if (catchState != null && finallyState != null &&
          catchState.tryStates.indexOf(finallyState.finallyState) >= 0) {
        // we have:
        //   try { try { ... } finally {} } catch (e) {}
        //
        // Generate:
        // case state:
        //   $ctx.state = finallyState.finallyState;
        //   $fallThrough = catchState.catchState;
        //   break;
        caseClauses.push(
            createCaseClause(
                createNumberLiteral(state),
                State.generateJumpThroughFinally(
                    finallyState.finallyState,
                    catchState.catchState)));
      } else if (catchState != null) {
        // we have:
        //   try { ... } catch (e) {}
        // Generate:
        // case state:
        //   $ctx.state = catchState.catchState;
        //   break;
        caseClauses.push(
            createCaseClause(
                createNumberLiteral(state),
                createStatementList(
                    createAssignStateStatement(catchState.catchState),
                    createBreakStatement())));
      } else if (finallyState != null) {
        // we have:
        //   try { ... } finally {}
        // Generate:
        // case state:
        //   $ctx.state = finallyState.startState;
        //   $fallThrough = rethrowState;
        //   break;
        caseClauses.push(
            createCaseClause(
                createNumberLiteral(state),
                State.generateJumpThroughFinally(
                    finallyState.finallyState,
                    rethrowState)));
      } else {
        // Anything not contained inside a 'try' block.
        // The 'default' case handles this, so don't generate anything.
      }
    }
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
    return this.statementsToStateMachine_([statement]);
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

    // case machine.fallThroughState: return false;
    cases.push(
        createCaseClause(
            createNumberLiteral(machine.fallThroughState),
            this.machineFallThroughStatements(machineEndState)));

    // case machineEndState: return false;
    cases.push(
        createCaseClause(
            createNumberLiteral(machineEndState),
            this.machineEndStatements()));

    // add top level rethrow exception state
    // case rethrow:
    //   throw $ctx.storedException;
    cases.push(
        createCaseClause(
            createNumberLiteral(rethrowState),
            this.machineRethrowStatements(machineEndState)));

    // default: throw "traceur compiler bug invalid state in state machine";
    cases.push(
        createDefaultClause(
            [createThrowStatement(
                createBinaryOperator(
                    createStringLiteral(
                        'traceur compiler bug: invalid state in state machine: '),
                    createOperatorToken(PLUS),
                    createMemberExpression('$ctx', 'state')))]));
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
                  $ctx.FinallyFallThroughState = ${State.INVALID_STATE};
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

  /**
   * transforms break/continue statements and their parents to state machines
   * @param {ParseTree} maybeTransformedStatement
   * @return {ParseTree}
   */
  maybeTransformStatement_(maybeTransformedStatement) {
    // Check for block scoped variables in a block containing a yield. There's
    // no way to codegen that with a precompiler but could be implemented
    // directly in a VM.
    if (maybeTransformedStatement.type == VARIABLE_STATEMENT &&
        maybeTransformedStatement.declarations.
            declarationType != VAR) {
      this.reporter.reportError(
          maybeTransformedStatement.location != null ?
              maybeTransformedStatement.location.start :
              null,
          'traceur: const/let declaration may not be ' +
          'in a block containing a yield.');
    }

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
}


function simplifyMachine(machine) {
  // We need to take exceptionBlocks into account too.
  return machine;

  var sourceToDestination = {};
  var destinationToSources = {};
  var stateMap = {};
  machine.states.forEach((source) => {
    stateMap[source.id] = source;
    var destinations = source.getDestinationStates();
    console.log(source.id, '->', destinations);
    sourceToDestination[source.id] = destinations;
    destinations.forEach((destination) => {
      var sources = destinationToSources[destination];
      if (!sources) {
        sources = destinationToSources[destination] = [];
      }
      if (sources.indexOf(source.id) === -1)
        sources.push(source.id);
    });
  });


  for (var i = 0; i < machine.states.length; i++) {
    var state = machine.states[i];
    if (!(state instanceof FallThroughState))
      continue;
    var destinations = state.getDestinationStates();
    if (destinations.length !== 1)
      continue;
    var destination = stateMap[destinations[0]];
    if (destination === undefined)
      continue;
    if (!(destination instanceof FallThroughState))
      continue;
    var sourcesInToDestination = destinationToSources[destinations[0]];
    if (sourcesInToDestination.length !== 1)
      continue;
    if (sourcesInToDestination[0] !== state.id)
      continue;
    machine = mergeStates(machine, state, destination);
    return simplifyMachine(machine);
  }


  return machine;
}

function mergeStates(machine, first, second) {
  assert(first instanceof FallThroughState);
  assert(second instanceof FallThroughState);
  var newState = new FallThroughState(first.id, second.fallThroughState,
      [...first.statements, ...second.statements]);

  var states = [];
  for (var i = 0; i < machine.states.length; i++) {
    if (machine.states[i] === first)
      states.push(newState);
    else if (machine.states[i] !== second)
      states.push(machine.states[i]);
  }

  return new StateMachine(
      machine.startState,
      machine.fallThroughState,
      states,
      machine.exceptionBlocks);
}
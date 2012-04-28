// Copyright 2011 Google Inc.
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

traceur.define('codegeneration.generator', function() {
  'use strict';

  var TokenType = traceur.syntax.TokenType;
  var ParseTree = traceur.syntax.trees.ParseTree;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;
  var PredefinedName = traceur.syntax.PredefinedName;

  var CaseClause = traceur.syntax.trees.CaseClause;
  var IdentifierExpression = traceur.syntax.trees.IdentifierExpression;
  var StateMachine = traceur.syntax.trees.StateMachine;
  var SwitchStatement = traceur.syntax.trees.SwitchStatement;

  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;

  var createArrayLiteralExpression = ParseTreeFactory.createArrayLiteralExpression;
  var createAssignStateStatement = ParseTreeFactory.createAssignStateStatement;
  var createAssignmentExpression = ParseTreeFactory.createAssignmentExpression;
  var createAssignmentStatement = ParseTreeFactory.createAssignmentStatement;
  var createBinaryOperator = ParseTreeFactory.createBinaryOperator;
  var createBindingIdentifier = ParseTreeFactory.createBindingIdentifier;
  var createBlock = ParseTreeFactory.createBlock;
  var createBoundCall = ParseTreeFactory.createBoundCall;
  var createBreakStatement = ParseTreeFactory.createBreakStatement;
  var createCaseClause = ParseTreeFactory.createCaseClause;
  var createCatch = ParseTreeFactory.createCatch;
  var createDefaultClause = ParseTreeFactory.createDefaultClause;
  var createEmptyParameterList = ParseTreeFactory.createEmptyParameterList;
  var createEmptyStatement = ParseTreeFactory.createEmptyStatement;
  var createExpressionStatement = ParseTreeFactory.createExpressionStatement;
  var createFunctionExpression = ParseTreeFactory.createFunctionExpression;
  var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
  var createIdentifierToken = ParseTreeFactory.createIdentifierToken;
  var createNumberLiteral = ParseTreeFactory.createNumberLiteral;
  var createOperatorToken = ParseTreeFactory.createOperatorToken;
  var createStatementList = ParseTreeFactory.createStatementList;
  var createStringLiteral = ParseTreeFactory.createStringLiteral;
  var createSwitchStatement = ParseTreeFactory.createSwitchStatement;
  var createThisExpression = ParseTreeFactory.createThisExpression;
  var createThrowStatement = ParseTreeFactory.createThrowStatement;
  var createTrueLiteral = ParseTreeFactory.createTrueLiteral;
  var createTryStatement = ParseTreeFactory.createTryStatement;
  var createVariableStatement = ParseTreeFactory.createVariableStatement;
  var createWhileStatement = ParseTreeFactory.createWhileStatement;

  var BreakState = traceur.codegeneration.generator.BreakState;
  var BreakContinueTransformer = traceur.codegeneration.generator.BreakContinueTransformer;
  var CatchState = traceur.codegeneration.generator.CatchState;
  var ConditionalState = traceur.codegeneration.generator.ConditionalState;
  var ContinueState = traceur.codegeneration.generator.ContinueState;
  var EndState = traceur.codegeneration.generator.EndState;
  var FallThroughState = traceur.codegeneration.generator.FallThroughState;
  var FinallyFallThroughState = traceur.codegeneration.generator.FinallyFallThroughState;
  var FinallyState = traceur.codegeneration.generator.FinallyState;
  var ForInTransformPass = traceur.codegeneration.generator.ForInTransformPass;
  var State = traceur.codegeneration.generator.State;
  var StateAllocator = traceur.codegeneration.generator.StateAllocator;
  var StateMachine = traceur.syntax.trees.StateMachine;
  var SwitchState = traceur.codegeneration.generator.SwitchState;
  var SwitchClause = traceur.codegeneration.generator.SwitchClause;
  var TryState = traceur.codegeneration.generator.TryState;
  var YieldState = traceur.codegeneration.generator.YieldState;

  var VariableBinder = traceur.semantics.VariableBinder;

  /**
   * Performs a CPS transformation on a method body.
   *
   * The conversion transformation proceeds bottom up. At the bottom Yield statements are converted
   * to a state machine, then when a transformed child statement is a state machine, the parent
   * statement is converted into a state machine.
   *
   * At the top level the state machine is translated into this method:
   *
   *      (function() {
   *       while (true) {
   *         try {
   *           switch ($state) {
   *           ... converted states ...
   *           case rethrow:
   *             throw $storedException;
   *           }
   *         } catch ($caughtException) {
   *           $storedException = $caughtException;
   *           switch ($state) {
   *           case enclosing_finally:
   *             $state = finally.startState;
   *             $fallThrough = rethrow;
   *             break;
   *           case enclosing_catch:
   *             $state = catch.startState;
   *             break;
   *           case enclosing_catch_around_finally:
   *             $state = finally.startState;
   *             $fallThrough = catch.startState;
   *             break;
   *           default:
   *             throw $storedException;
   *           }
   *         }
   *       }
   *     }).bind($that)
   *
   * Each state in a state machine is identified by an integer which is unique across the entire
   * function body. The state machine merge process may need to perform state id substitution on
   * states of the merged state machines.
   *
   * @param {ErrorReporter} reporter
   * @extends {ParseTreeTransformer}
   * @constructor
   */
  function CPSTransformer(reporter) {
    ParseTreeTransformer.call(this);
    this.reporter = reporter;
    this.stateAllocator_ = new StateAllocator();
    this.labelSet_ = Object.create(null);
  }

  var proto = ParseTreeTransformer.prototype;
  CPSTransformer.prototype = traceur.createObject(proto, {

    /** @return {number} */
    allocateState: function() {
      return this.stateAllocator_.allocateState();
    },

    /**
     * If a block contains a statement which has been transformed into a state machine, then
     * all statements are forcibly transformed into a state machine, then the machines are
     * knitted together.
     * @param {Block} tree
     * @return {ParseTree}
     */
    transformBlock: function(tree) {
      // NOTE: tree may contain state machines already ...
      this.clearLabels_();
      var transformedTree = proto.transformBlock.call(this, tree);
      var machine = this.transformStatementList_(transformedTree.statements);
      return machine == null ? transformedTree : machine;
    },

    /**
     * @param {Array.<ParseTree>} someTransformed
     * @return {StateMachine}
     */
    transformStatementList_: function(someTransformed) {
      // This block has undergone some transformation but may only be variable transforms
      // We only need to return a state machine if the block contains a yield which has been converted
      // to a state machine.
      if (!this.containsStateMachine_(someTransformed)) {
        return null;
      }

      // this block contains at least 1 yield statement which has been transformed into a
      // StateMachine. Transform all remaining statements into StateMachines then sequence
      // them together.
      var currentMachine = this.ensureTransformed_(someTransformed[0]);
      for (var index = 1; index < someTransformed.length; index++) {
        currentMachine = this.createSequence_(currentMachine,
            this.ensureTransformed_(someTransformed[index]));
      }

      return currentMachine;
    },

    /**
     * @param {Array.<ParseTree>|SwitchStatement} statements
     * @return {boolean}
     */
    containsStateMachine_: function(statements) {
      if (statements instanceof Array) {
        for (var i = 0; i < statements.length; i++) {
          if (statements[i].type == ParseTreeType.STATE_MACHINE) {
            return true;
          }
        }
        return false;
      }

      traceur.assert(statements instanceof SwitchStatement);
      for (var i = 0; i < statements.caseClauses.length; i++) {
        var clause = statements.caseClauses[i];
        if (clause.type == ParseTreeType.CASE_CLAUSE) {
          if (this.containsStateMachine_(clause.statements)) {
            return true;
          }
        } else {
          if (this.containsStateMachine_(clause.statements)) {
            return true;
          }
        }
      }
      return false;
    },

    /**
     * @param {CaseClause} tree
     * @return {ParseTree}
     */
    transformCaseClause: function(tree) {
      var result = proto.transformCaseClause.call(this, tree);
      var machine = this.transformStatementList_(result.statements);
      return machine == null ?
          result :
          new CaseClause(null, result.expression, createStatementList(machine));
    },

    /**
     * @param {DoWhileStatement} tree
     * @return {ParseTree}
     */
    transformDoWhileStatement: function(tree) {
      var labels = this.clearLabels_();

      var result = proto.transformDoWhileStatement.call(this, tree);
      if (result.body.type != ParseTreeType.STATE_MACHINE) {
        return result;
      }

      // a yield within a do/while loop
      var loopBodyMachine = result.body;
      var startState = loopBodyMachine.startState;
      var conditionState = loopBodyMachine.fallThroughState;
      var fallThroughState = this.allocateState();

      var states = [];

      this.addLoopBodyStates_(loopBodyMachine, conditionState, fallThroughState, labels, states);
      states.push(new ConditionalState(conditionState, startState, fallThroughState,
          result.condition));

      return new StateMachine(startState, fallThroughState, states,
          loopBodyMachine.exceptionBlocks);
    },

    /**
     * @param {StateMachine} loopBodyMachine
     * @param {number} continueState
     * @param {number} breakState
     * @param {Object} labels
     * @param {Array.<State>} states
     */
    addLoopBodyStates_: function(loopBodyMachine, continueState, breakState,
        labels, states) {
      for (var i = 0; i < loopBodyMachine.states.length; i++) {
        var state = loopBodyMachine.states[i];
        states.push(state.transformBreakOrContinue(labels, breakState, continueState));
      }
    },

    /**
     * @param {ForStatement} tree
     * @return {ParseTree}
     */
    transformForStatement: function(tree) {
      var labels = this.clearLabels_();

      var result = proto.transformForStatement.call(this, tree);
      if (result.body.type != ParseTreeType.STATE_MACHINE) {
        return result;
      }

      // a yield within the body of a 'for' statement
      var loopBodyMachine = result.body;

      var incrementState = loopBodyMachine.fallThroughState;
      var conditionState = result.increment == null && result.condition != null ?
          incrementState :
          this.allocateState();
      var startState = result.initializer == null ?
          conditionState :
          this.allocateState();
      var fallThroughState = this.allocateState();

      var states = [];
      if (result.initializer != null) {
        states.push(new FallThroughState(
            startState,
            conditionState,
            createStatementList(createExpressionStatement(result.initializer))));
      }
      if (result.condition != null) {
        states.push(new ConditionalState(
            conditionState,
            loopBodyMachine.startState,
            fallThroughState,
            result.condition));
      } else {
        // alternative is to renumber the loopbodyMachine.fallThrough to loopbodyMachine.start
        states.push(new FallThroughState(conditionState, loopBodyMachine.startState,
            createStatementList()));
      }
      if (result.increment != null) {
        states.push(new FallThroughState(
            incrementState,
            conditionState,
            createStatementList(
                createExpressionStatement(result.increment))));
      }
      this.addLoopBodyStates_(loopBodyMachine, incrementState, fallThroughState, labels, states);
      return new StateMachine(startState, fallThroughState, states,
          loopBodyMachine.exceptionBlocks);
    },

    /**
     * @param {ForInStatement} tree
     * @return {ParseTree}
     */
    transformForInStatement: function(tree) {
      // The only for in statement left is from the ForInTransformPass. Just pass it through.
      return tree;
    },

    /**
     * @param {ForOfStatement} tree
     * @return {ParseTree}
     */
    transformForOfStatement: function(tree) {
      throw new Error('for of statements should be transformed before this pass');
    },

    /**
     * @param {IfStatement} tree
     * @return {ParseTree}
     */
    transformIfStatement: function(tree) {
      this.clearLabels_();

      var result = proto.transformIfStatement.call(this, tree);
      if (result.ifClause.type != ParseTreeType.STATE_MACHINE &&
          (result.elseClause == null || result.elseClause.type != ParseTreeType.STATE_MACHINE)) {
        return result;
      }

      // if containing a yield
      var ifClause = this.ensureTransformed_(result.ifClause);
      var elseClause = this.ensureTransformed_(result.elseClause);

      var startState = this.allocateState();
      var fallThroughState = ifClause.fallThroughState;
      var ifState = ifClause.startState;
      var elseState = elseClause == null ? fallThroughState : elseClause.startState;

      var states = [];
      var exceptionBlocks = [];

      states.push(new ConditionalState(
          startState,
          ifState,
          elseState,
          result.condition));
      states.push.apply(states, ifClause.states);
      exceptionBlocks.push.apply(exceptionBlocks, ifClause.exceptionBlocks);
      if (elseClause != null) {
        this.replaceAndAddStates_(
            elseClause.states,
            elseClause.fallThroughState,
            fallThroughState,
            states);
        exceptionBlocks.push.apply(exceptionBlocks,
            State.replaceAllStates(elseClause.exceptionBlocks,
            elseClause.fallThroughState, fallThroughState));
      }

      return new StateMachine(startState, fallThroughState, states,
          exceptionBlocks);
    },

    /**
     * @param {Array.<State>} oldStates
     * @param {number} oldState
     * @param {number} newState
     * @param {Array.<State>} newStates
     */
    replaceAndAddStates_: function(oldStates, oldState, newState, newStates) {
      for (var i = 0; i < oldStates.length; i++) {
        newStates.push(oldStates[i].replaceState(oldState, newState));
      }
    },

    /**
     * @param {LabelledStatement} tree
     * @return {ParseTree}
     */
    transformLabelledStatement: function(tree) {
      var oldLabels = this.addLabel_(tree.name.value);

      var result = this.transformAny(tree.statement);

      this.restoreLabels_(oldLabels);

      return result;
    },

    clearLabels_: function() {
      var result = this.labelSet_;
      this.labelSet_ = Object.create(null);
      return result;
    },

    restoreLabels_: function(oldLabels) {
      this.labelSet_ = oldLabels;
    },

    /**
     * Adds a label to the current label set. Returns the OLD label set.
     * @param {string} label
     * @return {Object}
     */
    addLabel_: function(label) {
      var oldLabels = this.labelSet_;

      var labelSet = Object.create(null);
      for (var k in this.labelSet_) {
        labelSet[k] = k;
      }
      labelSet[label] = label;
      this.labelSet_ = labelSet;

      return oldLabels;
    },

    /**
     * @param {SwitchStatement} tree
     * @return {ParseTree}
     */
    transformSwitchStatement: function(tree) {
      var labels = this.clearLabels_();

      var result = proto.transformSwitchStatement.call(this, tree);
      if (!this.containsStateMachine_(result)) {
        return result;
      }

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
        if (clause.type == ParseTreeType.CASE_CLAUSE) {
          var caseClause = clause;
          nextState = this.addSwitchClauseStates_(nextState, fallThroughState,
              labels, caseClause.statements, states, tryStates);
          clauses.push(new SwitchClause(caseClause.expression, nextState));
        } else {
          hasDefault = true;
          var defaultClause = clause;
          nextState = this.addSwitchClauseStates_(nextState, fallThroughState,
              labels, defaultClause.statements, states, tryStates);
          clauses.push(new SwitchClause(null, nextState));
        }
      }
      if (!hasDefault) {
        clauses.push(new SwitchClause(null, fallThroughState));
      }
      states.push(new SwitchState(startState, result.expression, clauses.reverse()));

      return new StateMachine(startState, fallThroughState, states.reverse(),
          tryStates);
    },

    /**
     * @param {number} nextState
     * @param {number} fallThroughState
     * @param {Object} labels
     * @param {Array.<ParseTree>} statements
     * @param {Array.<ParseTree>} states
     * @param {Array.<TryState>} tryStates
     * @return {number}
     */
    addSwitchClauseStates_: function(nextState, fallThroughState, labels,
        statements, states, tryStates) {
      var machine = this.ensureTransformedList_(statements);
      for (var i = 0; i < machine.states.length; i++) {
        var state = machine.states[i];
        var transformedState = state.transformBreak(labels, fallThroughState);
        states.push(transformedState.replaceState(machine.fallThroughState, nextState));
      }
      tryStates.push.apply(tryStates, machine.exceptionBlocks);
      return machine.startState;
    },

    /**
     * @param {TryStatement} tree
     * @return {ParseTree}
     */
    transformTryStatement: function(tree) {
      this.clearLabels_();

      var result = proto.transformTryStatement.call(this, tree);
      if (result.body.type != ParseTreeType.STATE_MACHINE && (result.catchBlock == null ||
          result.catchBlock.catchBody.type != ParseTreeType.STATE_MACHINE)) {
        return result;
      }
      // NOTE: yield inside finally caught in FinallyBlock transform methods

      var tryMachine = this.ensureTransformed_(result.body);
      if (result.catchBlock != null) {
        var catchBlock = result.catchBlock;
        var exceptionName = catchBlock.binding.identifierToken.value;
        var catchMachine = this.ensureTransformed_(catchBlock.catchBody);
        var startState = tryMachine.startState;
        var fallThroughState = tryMachine.fallThroughState;

        var catchStart = this.allocateState();

        var states = [];
        states.push.apply(states, tryMachine.states);
        states.push(
            new FallThroughState(
                catchStart,
                catchMachine.startState,
                // exceptionName = $storedException;
                createStatementList(
            createAssignmentStatement(
            createIdentifierExpression(exceptionName),
            createIdentifierExpression(PredefinedName.STORED_EXCEPTION)))));
        this.replaceAndAddStates_(catchMachine.states, catchMachine.fallThroughState, fallThroughState,
            states);

        tryMachine = new StateMachine(
            startState,
            fallThroughState,
            states,
            [new CatchState(
                exceptionName,
                catchStart,
                fallThroughState,
                tryMachine.getAllStateIDs(),
                tryMachine.exceptionBlocks)]);
      }
      if (result.finallyBlock != null) {
        var finallyBlock = result.finallyBlock;
        var finallyMachine = this.ensureTransformed_(finallyBlock.block);
        var startState = tryMachine.startState;
        var fallThroughState = tryMachine.fallThroughState;

        var states = [];
        states.push.apply(states, tryMachine.states);
        states.push.apply(states, finallyMachine.states);
        states.push(new FinallyFallThroughState(finallyMachine.fallThroughState));

        // NOTE: finallyMachine.fallThroughState == FinallyState.fallThroughState is code generated
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
      }

      return tryMachine;
    },

    /**
     * Local variables are lifted out of moveNext to the enclosing function in the generated code.
     * Because of this there's no good way to codegen block scoped let/const variables where there
     * is a yield in the scope of the block scoped variable.
     *
     * @param {VariableStatement} tree
     * @return {ParseTree}
     */
    transformVariableStatement: function(tree) {
      var declarations = this.transformVariableDeclarationList(tree.declarations);
      if (declarations == tree.declarations) {
        return tree;
      }
      if (declarations == null) {
        return createEmptyStatement();
      }
      if (declarations.type == ParseTreeType.VARIABLE_DECLARATION_LIST) {
        // let/const - just transform for now
        return createVariableStatement(declarations);
      }
      return createExpressionStatement(declarations);
    },

    /**
     * This is the initializer of a for loop. Convert into an expression containing the initializers.
     *
     * @param {VariableDeclarationList} tree
     * @return {ParseTree}
     */
    transformVariableDeclarationList: function(tree) {
      if (tree.declarationType == TokenType.VAR) {
        var expressions = [];
        for (var i = 0; i < tree.declarations.length; i++) {
          var declaration = tree.declarations[i];
          if (declaration.initializer != null) {
            expressions.push(createAssignmentExpression(
                createIdentifierExpression(
                    this.transformAny(declaration.lvalue)),
                this.transformAny(declaration.initializer)));
          }
        }
        var list = expressions;
        if (list.length == 0) {
          return null;
        } else if (list.length == 1) {
          return list[0];
        } else {
          // CONSIDER: a better way to execute a sequence of expressions and discard the results?
          return createArrayLiteralExpression(expressions);
        }
      }
      // let/const - just transform for now
      return proto.transformVariableDeclarationList.call(this, tree);
    },

    /**
     * @param {WhileStatement} tree
     * @return {ParseTree}
     */
    transformWhileStatement: function(tree) {
      var labels = this.clearLabels_();

      var result = proto.transformWhileStatement.call(this, tree);
      if (result.body.type != ParseTreeType.STATE_MACHINE) {
        return result;
      }

      // a yield within a while loop
      var loopBodyMachine = result.body;
      var startState = loopBodyMachine.fallThroughState;
      var fallThroughState = this.allocateState();

      var states = [];

      states.push(new ConditionalState(
          startState,
          loopBodyMachine.startState,
          fallThroughState,
          result.condition));
      this.addLoopBodyStates_(loopBodyMachine, startState, fallThroughState, labels, states);

      return new StateMachine(startState, fallThroughState, states,
          loopBodyMachine.exceptionBlocks);
    },

    /**
     * @param {WithStatement} tree
     * @return {ParseTree}
     */
    transformWithStatement: function(tree) {
      var result = proto.transformWithStatement.call(this, tree);
      if (result.body.type != ParseTreeType.STATE_MACHINE) {
        return result;
      }
      throw new Error('Unreachable - with statement not allowed in strict mode/harmony');
    },

    /**
     * @param {ThisExpression} tree
     * @return {ParseTree}
     */
    transformThisExpression: function(tree) {
      // TODO: this can be removed...
      return createIdentifierExpression(PredefinedName.THAT);
    },

    //      (function() {
    //       while (true) {
    //         try {
    //           switch ($state) {
    //           ... converted states ...
    //           case rethrow:
    //             throw $storedException;
    //           }
    //         } catch ($caughtException) {
    //           $storedException = $caughtException;
    //           switch ($state) {
    //           case enclosing_finally:
    //             $state = finally.startState;
    //             $fallThrough = rethrow;
    //             break;
    //           case enclosing_catch:
    //             $state = catch.startState;
    //             break;
    //           case enclosing_catch_around_finally:
    //             $state = finally.startState;
    //             $fallThrough = catch.startState;
    //             break;
    //           default:
    //             throw $storedException;
    //           }
    //         }
    //       }
    //     }).bind($that)
    /**
     * @param {StateMachine} machine
     * @return {CallExpression}
     */
    generateMachineMethod: function(machine) {
      //  (function() {
      return createBoundCall(
          createFunctionExpression(createEmptyParameterList(),
              //     while (true) {
              createBlock(createWhileStatement(
                  createTrueLiteral(),
                  this.generateMachine(machine)))),
          //       }
          //     }
          // }).bind($that);
          createIdentifierExpression(PredefinedName.THAT));
    },

    /** @return {VariableStatement} */
    generateHoistedThis: function() {
      // Hoist 'this' argument for later bind-ing.
      //   var $that = this;
      return createVariableStatement(TokenType.VAR, PredefinedName.THAT,
          createThisExpression());
    },

    /**
     * @param {StateMachine} machine
     * @return {ParseTree}
     */
    generateMachine: function(machine) {
      var enclosingFinallyState = machine.getEnclosingFinallyMap();
      var enclosingCatchState = machine.getEnclosingCatchMap();
      var rethrowState = this.allocateState();
      var machineEndState = this.allocateState();
      var body =
          //       switch ($state) {
          createSwitchStatement(createIdentifierExpression(PredefinedName.STATE),
          //       ... converted states
          this.transformMachineStates(machine, machineEndState, rethrowState, enclosingFinallyState));

      // try {
      //   ...
      // } catch ($caughtException) {
      //   $storedException = $caughtException;
      //   switch ($state) {
      //   case enclosing_finally:
      //     $state = finally.startState;
      //     $fallThrough = rethrow;
      //     break;
      //   case enclosing_catch:
      //     $state = catch.startState;
      //     break;
      //   case enclosing_catch_around_finally:
      //     $state = finally.startState;
      //     $fallThrough = catch.startState;
      //     break;
      //   default:
      //     throw $storedException;
      //   }
      // }
      var caseClauses = [];
      this.addExceptionCases_(rethrowState, enclosingFinallyState,
          enclosingCatchState, machine.getAllStateIDs(), caseClauses);
      //   default:
      //     throw $storedException;
      caseClauses.push(createDefaultClause(this.machineUncaughtExceptionStatements(rethrowState)));

      // try {
      //   ...
      // } catch ($caughtException) {
      //   $storedException = $caughtException;
      //   switch ($state) {
      body = createTryStatement(
          createBlock(body),
          createCatch(
              createBindingIdentifier(PredefinedName.CAUGHT_EXCEPTION),
              createBlock(
                  createAssignmentStatement(
                      createIdentifierExpression(PredefinedName.STORED_EXCEPTION),
                      createIdentifierExpression(PredefinedName.CAUGHT_EXCEPTION)),
                  createSwitchStatement(
                      createIdentifierExpression(PredefinedName.STATE),
                      caseClauses))),
          null);

      return body;
    },

    //   var $state = machine.startState;
    //   var $storedException;
    //   var $finallyFallThrough;
    //   ... lifted local variables ...
    //   ... caught exception variables ...
    /**
     * @param {Block} tree
     * @param {StateMachine} machine
     * @return {Array.<ParseTree>}
     */
    getMachineVariables: function(tree, machine) {

      var statements = [];

      //   var $state = machine.startState;
      statements.push(createVariableStatement(TokenType.VAR, PredefinedName.STATE,
          createNumberLiteral(machine.startState)));

      // var $storedException;
      statements.push(createVariableStatement(TokenType.VAR, PredefinedName.STORED_EXCEPTION, null));

      // var $finallyFallThrough;
      statements.push(
          createVariableStatement(TokenType.VAR, PredefinedName.FINALLY_FALL_THROUGH, null));

      // Lift locals ...
      var liftedIdentifiers =
          VariableBinder.variablesInBlock(tree, true);

      // ... and caught exceptions
      // TODO: this changes the scope of caught exception variables from 'let to 'var'.
      // Fix this once we have 'let' bindings in V8.
      var allCatchStates = machine.allCatchStates();
      for (var i = 0; i < allCatchStates.length; i++) {
        liftedIdentifiers[allCatchStates[i].identifier] = true;
      }

      // Sort identifiers to produce a stable output order
      var liftedIdentifierList = Object.keys(liftedIdentifiers).sort();
      for (var i = 0; i < liftedIdentifierList.length; i++) {
        var liftedIdentifier = liftedIdentifierList[i];
        statements.push(createVariableStatement(TokenType.VAR, liftedIdentifier, null));
      }

      return statements;
    },

    /**
     * @param {number} rethrowState
     * @param {Object} enclosingFinallyState
     * @param {Object} enclosingCatchState
     * @param {Array.<number>} allStates
     * @param {Array.<number>} caseClauses
     */
    addExceptionCases_: function(rethrowState, enclosingFinallyState,
        enclosingCatchState, allStates, caseClauses) {

      for (var i = 0; i < allStates.length; i++) {
        var state = allStates[i];
        var finallyState = enclosingFinallyState[state];
        var catchState = enclosingCatchState[state];
        if (catchState != null && finallyState != null &&
            catchState.tryStates.indexOf(finallyState.finallyState) >= 0) {
          // we have:
          //   try { try { ... } finally {} } catch (e) {}
          //
          // Generate:
          // case state:
          //   $state = finallyState.finallyState;
          //   $fallThrough = catchState.catchState;
          //   break;
          caseClauses.push(
              createCaseClause(
                  createNumberLiteral(state),
                  State.generateJumpThroughFinally(finallyState.finallyState,
                      catchState.catchState)));
        } else if (catchState != null) {
          // we have:
          //   try { ... } catch (e) {}
          // Generate:
          // case state:
          //   $state = catchState.catchState;
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
          //   $state = finallyState.startState;
          //   $fallThrough = rethrowState;
          //   break;
          caseClauses.push(
              createCaseClause(
                  createNumberLiteral(state),
                  State.generateJumpThroughFinally(finallyState.finallyState, rethrowState)));
        } else {
          // we have no try's around this state.
          // Generate Nothing.
        }
      }
    },

    /**
     * @param {FunctionDeclaration} tree
     * @return {ParseTree}
     */
    transformFunctionDeclaration: function(tree) {
      this.clearLabels_();
      // nested functions have already been transformed
      return tree;
    },

    /**
     * @param {GetAccessor} tree
     * @return {ParseTree}
     */
    transformGetAccessor: function(tree) {
      // nested functions have already been transformed
      return tree;
    },

    /**
     * @param {SetAccessor} tree
     * @return {ParseTree}
     */
    transformSetAccessor: function(tree) {
      // nested functions have already been transformed
      return tree;
    },

    /**
     * @param {StateMachine} tree
     * @return {ParseTree}
     */
    transformStateMachine: function(tree) {
      return tree;
    },

    /**
     * Converts a statement into a state machine. The statement may not contain a yield
     * statement directly or indirectly.
     * @param {ParseTree} statements
     * @return {StateMachine}
     */
    statementToStateMachine_: function(statement) {
      return this.statementsToStateMachine_([statement]);
    },

    /**
     * Converts a list of statements into a state machine. The statements may not contain a yield
     * statement directly or indirectly.
     * @param {Array.<ParseTree>} statements
     * @return {StateMachine}
     */
    statementsToStateMachine_: function(statements) {
      var startState = this.allocateState();
      var fallThroughState = this.allocateState();
      return this.stateToStateMachine_(
          new FallThroughState(
              startState,
              fallThroughState,
              statements),
          fallThroughState);
    },

    /**
     * @param {State} newState
     * @param {number} fallThroughState
     * @return {StateMachibneTree}
     */
    stateToStateMachine_: function(newState, fallThroughState) {
      return new StateMachine(newState.id, fallThroughState,
          [newState], []);
    },

    /**
     * Transforms all the machine states into a list of case clauses. Adds a rethrow clause if the
     * machine has any try blocks. Also adds a 'default' clause which indicates a compiler bug in
     * the state machine generation.
     * @param {StateMachine} machine
     * @param {number} machineEndState
     * @param {number} rethrowState
     * @param {Object} enclosingFinallyState
     * @return {Array.<ParseTree>}
     */
    transformMachineStates: function(machine, machineEndState, rethrowState,
        enclosingFinallyState) {
      var cases = [];

      for (var i = 0; i < machine.states.length; i++) {
        var state = machine.states[i];
        var stateCase = state.transformMachineState(enclosingFinallyState[state.id],
            machineEndState, this.reporter);
        if (stateCase != null) {
          cases.push(stateCase);
        }
      }

      // add finally fallthrough dispatch states
      this.addFinallyFallThroughDispatches(null, machine.exceptionBlocks, cases);

      // case machine.fallThroughState: return false;
      cases.push(createCaseClause(createNumberLiteral(machine.fallThroughState),
          this.machineFallThroughStatements(machineEndState)));

      // case machineEndState: return false;
      cases.push(createCaseClause(createNumberLiteral(machineEndState),
          this.machineEndStatements()));

      // add top level rethrow exception state
      // case rethrow:
      //   throw $storedException;
      cases.push(createCaseClause(
          createNumberLiteral(rethrowState),
          this.machineRethrowStatements(machineEndState)));

      // default: throw "traceur compiler bug invalid state in state machine";
      cases.push(createDefaultClause(
          [createThrowStatement(
              createBinaryOperator(
                  createStringLiteral('traceur compiler bug: invalid state in state machine'),
                  createOperatorToken(TokenType.PLUS),
                  createIdentifierExpression(PredefinedName.STATE)))]));
      return cases;
    },

    /**
     * @param {FinallyState} enclosingFinallyState
     * @param {Array.<TryState>} tryStates
     * @param {Array.<ParseTree>} cases
     */
    addFinallyFallThroughDispatches: function(enclosingFinallyState, tryStates,
        cases) {

      for (var i = 0; i < tryStates.length; i++) {
        var tryState = tryStates[i];
        if (tryState.kind == TryState.Kind.FINALLY) {
          var finallyState = tryState;

          if (enclosingFinallyState != null) {
            var caseClauses = [];
            var index = 0;
            // CONSIDER: the actual list is much less than enclosingFinallyState.tryStates
            // CONSIDER: it is actually only jump destinations plus catch starts
            for (var j = 0; j < enclosingFinallyState.tryStates.length; j++) {
              var destination = enclosingFinallyState.tryStates[j];
              index++;
              var statements;
              // all but the last case fallthrough to the last case clause
              if (index < enclosingFinallyState.tryStates.length) {
                statements = createStatementList();
              } else {
                statements = createStatementList(
                    // $state = $fallThrough;
                    createAssignmentStatement(
                        createIdentifierExpression(PredefinedName.STATE),
                        createIdentifierExpression(PredefinedName.FINALLY_FALL_THROUGH)),
                    // $fallThrough = INVALID_STATE;
                    createAssignmentStatement(
                        createIdentifierExpression(PredefinedName.FINALLY_FALL_THROUGH),
                        createNumberLiteral(State.INVALID_STATE)),
                    // break;
                    createBreakStatement());
              }
              caseClauses.push(createCaseClause(createNumberLiteral(destination), statements));
            }
            caseClauses.push(createDefaultClause(createStatementList(
                // $state = enclosingFinallyState.startState;
                createAssignStateStatement(enclosingFinallyState.finallyState),
                // break;
                createBreakStatement())));

            // case finally.fallThroughState:
            //   switch ($fallThrough) {
            //   case enclosingFinally.tryStates:
            //   ...
            //     $state = $fallThrough;
            //     $fallThrough = INVALID_STATE;
            //     break;
            //   default:
            //     $state = enclosingFinallyBlock.startState;
            //     break;
            //   }
            //   break;
            cases.push(
                createCaseClause(
                    createNumberLiteral(finallyState.fallThroughState),
                    createStatementList(
                        createSwitchStatement(
                            createIdentifierExpression(PredefinedName.FINALLY_FALL_THROUGH),
                            caseClauses),
                        createBreakStatement())));
          } else {
            // case finally.fallThroughState:
            //   $state = $fallThrough;
            //   break;
            cases.push(
                createCaseClause(
                    createNumberLiteral(finallyState.fallThroughState),
                    createStatementList(
                        createAssignmentStatement(
                            createIdentifierExpression(PredefinedName.STATE),
                            createIdentifierExpression(PredefinedName.FINALLY_FALL_THROUGH)),
                        createBreakStatement())));
          }
          this.addFinallyFallThroughDispatches(
              finallyState,
              finallyState.nestedTrys,
              cases);
        } else {
          this.addFinallyFallThroughDispatches(
              enclosingFinallyState,
              tryState.nestedTrys,
              cases);
        }
      }
    },

    /**
     * Returns a new state machine which will run head, then run tail.
     * @param {StateMachine} head
     * @param {StateMachine} tail
     * @return {StateMachine}
     */
    createSequence_: function(head, tail) {
      var states = [];

      states.push.apply(states, head.states);
      for (var i = 0; i < tail.states.length; i++) {
        var tailState = tail.states[i];
        states.push(tailState.replaceState(tail.startState, head.fallThroughState));
      }

      var exceptionBlocks = [];
      exceptionBlocks.push.apply(exceptionBlocks, head.exceptionBlocks);
      for (var i = 0; i < tail.exceptionBlocks.length; i++) {
        var tryState = tail.exceptionBlocks[i];
        exceptionBlocks.push(tryState.replaceState(tail.startState, head.fallThroughState));
      }

      return new StateMachine(
          head.startState,
          tail.fallThroughState,
          states,
          exceptionBlocks);
    },


    /**
     * transforms break/continue statements and their parents to state machines
     * @param {ParseTree} maybeTransformedStatement
     * @return {ParseTree}
     */
    maybeTransformStatement_: function(maybeTransformedStatement) {
      // Check for block scoped variables in a block containing a yield. There's
      // no way to codegen that with a precompiler but could be implemented directly in a VM.
      if (maybeTransformedStatement.type == ParseTreeType.VARIABLE_STATEMENT &&
          maybeTransformedStatement.declarations.declarationType !=
              TokenType.VAR) {
        this.reporter.reportError(
            maybeTransformedStatement.location != null ?
                maybeTransformedStatement.location.start :
                null,
            'traceur: const/let declaration may not be in a block containing a yield.');
      }

      // transform break/continue statements and their parents to state machines
      var breakContinueTransformed =
          new BreakContinueTransformer(this.stateAllocator_).transformAny(maybeTransformedStatement);
      if (breakContinueTransformed != maybeTransformedStatement) {
        breakContinueTransformed = this.transformAny(breakContinueTransformed);
      }
      return breakContinueTransformed;
    },

    /**
     * Ensure that a statement has been transformed into a state machine.
     * @param {ParseTree} statement
     * @return {StateMachine}
     */
    ensureTransformed_: function(statement) {
      if (statement == null) {
        return null;
      }
      var maybeTransformed = this.maybeTransformStatement_(statement);
      return maybeTransformed.type == ParseTreeType.STATE_MACHINE ?
          maybeTransformed :
          this.statementToStateMachine_(maybeTransformed);
    },

    /**
     * Ensure that a statement has been transformed into a state machine.
     * @param {Array.<ParseTree>} statements
     * @return {StateMachine}
     */
    ensureTransformedList_: function(statements) {
      var maybeTransformedStatements = [];
      var foundMachine = false;
      for (var i = 0; i < statements.length; i++) {
        var statement = statements[i];
        var maybeTransformedStatement = this.maybeTransformStatement_(statement);
        maybeTransformedStatements.push(maybeTransformedStatement);
        if (maybeTransformedStatement.type == ParseTreeType.STATE_MACHINE) {
          foundMachine = true;
        }
      }
      if (!foundMachine) {
        return this.statementsToStateMachine_(statements);
      }

      return this.transformStatementList_(maybeTransformedStatements);
    }
  });

  return {
    CPSTransformer: CPSTransformer
  };
});

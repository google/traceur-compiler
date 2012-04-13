// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
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

  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;

  var CPSTransformer = traceur.codegeneration.generator.CPSTransformer;
  var StateMachine = traceur.syntax.trees.StateMachine;
  var AsyncState = traceur.codegeneration.generator.AsyncState;
  var EndState = traceur.codegeneration.generator.EndState;
  var FallThroughState = traceur.codegeneration.generator.FallThroughState;

  var createArgumentList = ParseTreeFactory.createArgumentList;
  var createAssignStateStatement = ParseTreeFactory.createAssignStateStatement;
  var createAssignmentStatement = ParseTreeFactory.createAssignmentStatement;
  var createBlock = ParseTreeFactory.createBlock;
  var createBreakStatement = ParseTreeFactory.createBreakStatement;
  var createCallExpression = ParseTreeFactory.createCallExpression;
  var createCallStatement = ParseTreeFactory.createCallStatement;
  var createCallback = ParseTreeFactory.createCallback;
  var createEmptyArgumentList = ParseTreeFactory.createEmptyArgumentList;
  var createErrback = ParseTreeFactory.createErrback;
  var createFunctionExpression = ParseTreeFactory.createFunctionExpression;
  var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createNewExpression = ParseTreeFactory.createNewExpression;
  var createNumberLiteral = ParseTreeFactory.createNumberLiteral;
  var createParameterList = ParseTreeFactory.createParameterList;
  var createParameterReference = ParseTreeFactory.createParameterReference;
  var createPromise = ParseTreeFactory.createPromise;
  var createReturnStatement = ParseTreeFactory.createReturnStatement;
  var createStatementList = ParseTreeFactory.createStatementList;
  var createThrowStatement = ParseTreeFactory.createThrowStatement;
  var createUndefinedExpression = ParseTreeFactory.createUndefinedExpression;
  var createVariableStatement = ParseTreeFactory.createVariableStatement;


  /**
   * Desugars async function bodies. Async function bodies contain 'async' statements.
   *
   * At the top level the state machine is translated into this source code:
   *
   * {
   *   var $that = this;
   *   machine variables
   *   var $value;
   *   var $err;
   *   var $continuation = machineMethod;
   *   var $cancel = ...;
   *   var $result = new Deferred($cancel);
   *   var $waitTask;
   *   var $createCallback = function(newState) { function (value) { $state = newState; $value = value; $continuation(); }}
   *   var $createErrback = function(newState) { function (err) { $state = newState; $err = err; $continuation(); }}
   *   $continuation();
   *   return $result.createPromise();
   * }
   *
   * @param {ErrorReporter} reporter
   * @extends {CPSTransformer}
   * @constructor
   */
  function AsyncTransformer(reporter) {
    CPSTransformer.call(this, reporter);
  }

  /**
   * @param {ErrorReporter} reporter
   * @param {Block} body
   * @return {Block}
   */
  AsyncTransformer.transformAsyncBody = function(reporter, body) {
    return new AsyncTransformer(reporter).transformAsyncBody(body);
  };

  var proto = CPSTransformer.prototype;
  AsyncTransformer.prototype = traceur.createObject(proto, {

    /**
     * Yield statements are translated into a state machine with a single state.
     * @param {YieldStatement} tree
     * @return {ParseTree}
     */
    transformYieldStatement: function(tree) {
      this.reporter.reportError(tree.location.start,
          'Async function may not have a yield statement.');
      return tree;
    },

    /**
     * @param {AwaitStatement} tree
     * @return {ParseTree}
     */
    transformAwaitStatement: function(tree) {
      var createTaskState = this.allocateState();
      var callbackState = this.allocateState();
      var errbackState = this.allocateState();
      var fallThroughState = this.allocateState();

      var states = [];
      //  case createTaskState:
      //    $waitTask = expression;
      //    $waitTask.then($createCallback(callbackState), $createErrback(errbackState));
      //    return;
      states.push(new FallThroughState(createTaskState, callbackState, createStatementList(
          createAssignmentStatement(
              createIdentifierExpression(PredefinedName.WAIT_TASK),
              tree.expression),
          createCallStatement(
              createMemberExpression(PredefinedName.WAIT_TASK, PredefinedName.THEN),
              createArgumentList(
                  createCallExpression(createIdentifierExpression(PredefinedName.CREATE_CALLBACK),
                      createArgumentList(createNumberLiteral(callbackState))),
                  createCallExpression(createIdentifierExpression(PredefinedName.CREATE_ERRBACK),
                      createArgumentList(createNumberLiteral(errbackState))))),
          createReturnStatement(null))));
      //  case callbackState:
      //    identifier = $value;
      //    $state = fallThroughState;
      //    break;
      var assignment;
      if (tree.identifier != null) {
        assignment = createStatementList(
            createAssignmentStatement(
            createIdentifierExpression(tree.identifier),
            createIdentifierExpression(PredefinedName.$VALUE)));
      } else {
        assignment = createStatementList();
      }
      states.push(new FallThroughState(callbackState, fallThroughState, assignment));
      //  case errbackState:
      //    throw $err;
      states.push(new FallThroughState(errbackState, fallThroughState, createStatementList(
          createThrowStatement(createIdentifierExpression(PredefinedName.ERR)))));

      return new StateMachine(createTaskState, fallThroughState, states, []);
    },

    /**
     * @param {Finally} tree
     * @return {ParseTree}
     */
    transformFinally: function(tree) {
      var result = proto.transformFinally.call(this, tree);
      if (result.block.type != ParseTreeType.STATE_MACHINE) {
        return result;
      }
      // TODO: is this a reasonable restriction?
      this.reporter.reportError(tree.location.start, 'async not permitted within a finally block.');
      return result;
    },

    /**
     * @param {ReturnStatement} tree
     * @return {ParseTree}
     */
    transformReturnStatement: function(tree) {
      var result = tree.expression;
      if (result == null) {
        result = createUndefinedExpression();
      }
      var startState = this.allocateState();
      var endState = this.allocateState();
      var completeState = new FallThroughState(startState, endState,
          // $result.callback(result);
          createStatementList(this.createCompleteTask_(result)));
      var end = new EndState(endState);
      return new StateMachine(
          startState,
          // TODO: this should not be required, but removing requires making consumers resilient
          // TODO: to INVALID fallThroughState
          this.allocateState(),
          [completeState, end],
          []);
    },

    /**
     * @param {ParseTree} tree
     * @return {ParseTree}
     */
    createCompleteTask_: function(result) {
      return createCallStatement(
          createMemberExpression(PredefinedName.RESULT, PredefinedName.CALLBACK),
          createArgumentList(result));
    },

    /**
     * Transform an async function body - removing async statements.
     * The transformation is in two stages. First the statements are converted into a single
     * state machine by merging state machines via a bottom up traversal.
     *
     * Then the final state machine is converted into the following code:
     *
     * {
     *   var $that = this;
     *   machine variables
     *   var $value;
     *   var $err;
     *   var $continuation = machineMethod;
     *   var $cancel = ...;
     *   var $result = new Deferred($cancel);
     *   var $waitTask;
     *   var $createCallback = function(newState) { return function (value) { $state = newState; $value = value; $continuation(); }}
     *   var $createErrback = function(newState) { return function (err) { $state = newState; $err = err; $continuation(); }}
     *   $continuation();
     *   return $result.createPromise();
     * }
     * TODO: add close() method which executes pending finally clauses
     * @param {Block} tree
     * @return {Block}
     */
    transformAsyncBody: function(tree) {
      // transform to a state machine
      var transformedTree = this.transformAny(tree);
      if (this.reporter.hadError()) {
        return tree;
      }
      var machine = transformedTree;

      var statements = [];

      //   var $that = this;
      statements.push(this.generateHoistedThis());
      //     lifted machine variables
      statements.push.apply(statements, this.getMachineVariables(tree, machine));
      //   var $value;
      statements.push(createVariableStatement(
          TokenType.VAR,
          PredefinedName.$VALUE,
          null));
      //   var $err;
      statements.push(createVariableStatement(
          TokenType.VAR,
          PredefinedName.ERR,
          null));
      // TODO: var $cancel = ...;
      //   var $result = new Deferred();
      statements.push(createVariableStatement(
          TokenType.VAR,
          PredefinedName.RESULT,
          createNewExpression(
              createIdentifierExpression(PredefinedName.DEFERRED),
              createEmptyArgumentList())));
      //   var $waitTask;
      statements.push(createVariableStatement(
          TokenType.VAR,
          PredefinedName.WAIT_TASK,
          null));
      //   var $continuation = machineMethod;
      statements.push(createVariableStatement(
          TokenType.VAR,
          PredefinedName.CONTINUATION,
          this.generateMachineMethod(machine)));
      //   var $createCallback = function(newState) { return function (value) { $state = newState; $value = value; $continuation(); }}
      statements.push(createVariableStatement(
          TokenType.VAR,
          PredefinedName.CREATE_CALLBACK,
          createFunctionExpression(
              createParameterList(PredefinedName.NEW_STATE),
              createBlock(
                  createReturnStatement(
                      createFunctionExpression(
                          createParameterList(1),
                          createBlock(
                              createAssignmentStatement(
                                  createIdentifierExpression(PredefinedName.STATE),
                                  createIdentifierExpression(PredefinedName.NEW_STATE)),
                                  createAssignmentStatement(
                                      createIdentifierExpression(PredefinedName.$VALUE),
                                      createParameterReference(0)),
                                  createCallStatement(createIdentifierExpression(PredefinedName.CONTINUATION)))))))));
      //   var $createErrback = function(newState) { return function (err) { $state = newState; $err = err; $continuation(); }}
      statements.push(createVariableStatement(
          TokenType.VAR,
          PredefinedName.CREATE_ERRBACK,
          createFunctionExpression(
              createParameterList(PredefinedName.NEW_STATE),
              createBlock(
                  createReturnStatement(
                      createFunctionExpression(
                          createParameterList(1),
                          createBlock(
                              createAssignmentStatement(
                                  createIdentifierExpression(PredefinedName.STATE),
                                  createIdentifierExpression(PredefinedName.NEW_STATE)),
                                  createAssignmentStatement(
                                      createIdentifierExpression(PredefinedName.ERR),
                                      createParameterReference(0)),
                                  createCallStatement(createIdentifierExpression(PredefinedName.CONTINUATION)))))))));
      //  $continuation();
      statements.push(createCallStatement(createIdentifierExpression(PredefinedName.CONTINUATION)));
      //  return $result.createPromise();
      statements.push(createReturnStatement(
          createCallExpression(
              createMemberExpression(PredefinedName.RESULT, PredefinedName.CREATE_PROMISE))));

      return createBlock(statements);
    },

    /**
     * @param {number} rethrowState
     * @return {Array.<ParseTree>}
     */
    machineUncaughtExceptionStatements: function(rethrowState) {
      return createStatementList(
          createAssignStateStatement(rethrowState),
          createBreakStatement());
    },

    /** @return {Array.<ParseTree>} */
    machineEndStatements: function() {
      // return;
      return createStatementList(createReturnStatement(null));
    },

    /**
     * @param {number} machineEndState
     * @return {Array.<ParseTree>}
     */
    machineFallThroughStatements: function(machineEndState) {
      // $waitTask.callback(undefined);
      // $state = machineEndState;
      // break;
      return createStatementList(
          this.createCompleteTask_(createUndefinedExpression()),
          createAssignStateStatement(machineEndState),
          createBreakStatement());
    },

    /**
     * @param {number} machineEndState
     * @return {Array.<ParseTree>}
     */
    machineRethrowStatements: function(machineEndState) {
      return createStatementList(
          // $result.errback($storedException);
          createCallStatement(
          createMemberExpression(PredefinedName.RESULT, PredefinedName.ERRBACK),
          createArgumentList(createIdentifierExpression(PredefinedName.STORED_EXCEPTION))),
          // $state = machineEndState
          createAssignStateStatement(machineEndState),
          // break;
          createBreakStatement());
    }
  });

  return {
    AsyncTransformer: AsyncTransformer
  };
});

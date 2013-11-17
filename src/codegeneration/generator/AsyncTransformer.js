// Copyright 2012 Traceur Authors.
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

import {CPSTransformer} from './CPSTransformer';
import {EndState} from './EndState';
import {FallThroughState} from './FallThroughState';
import {
  $VALUE,
  CALLBACK,
  CONTINUATION,
  CREATE_CALLBACK,
  CREATE_ERRBACK,
  CREATE_PROMISE,
  DEFERRED,
  ERR,
  ERRBACK,
  NEW_STATE,
  RESULT,
  STATE,
  STORED_EXCEPTION,
  THEN,
  WAIT_TASK
} from '../../syntax/PredefinedName';
import {STATE_MACHINE} from '../../syntax/trees/ParseTreeType';
import {parseStatement} from '../PlaceholderParser';
import {StateMachine} from '../../syntax/trees/StateMachine';
import {VAR} from '../../syntax/TokenType';
import {
  createArgumentList,
  createAssignStateStatement,
  createAssignmentStatement,
  createBlock,
  createBreakStatement,
  createCallExpression,
  createCallStatement,
  createEmptyArgumentList,
  createFunctionExpression,
  createFunctionBody,
  createIdentifierExpression,
  createMemberExpression,
  createNewExpression,
  createNumberLiteral,
  createParameterList,
  createParameterReference,
  createReturnStatement,
  createStatementList,
  createThrowStatement,
  createUndefinedExpression,
  createVariableStatement
} from '../ParseTreeFactory';

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
 */
export class AsyncTransformer extends CPSTransformer {
  /**
   * Yield statements are translated into a state machine with a single state.
   * @param {YieldExpression} tree
   * @return {ParseTree}
   */
  transformYieldExpression(tree) {
    this.reporter.reportError(tree.location.start,
        'Async function may not have a yield expression.');
    return tree;
  }

  /**
   * @param {AwaitStatement} tree
   * @return {ParseTree}
   */
  transformAwaitStatement(tree) {
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
            createIdentifierExpression(WAIT_TASK),
            this.transformAny(tree.expression)),
        createCallStatement(
            createMemberExpression(WAIT_TASK, THEN),
            createArgumentList(
                createCallExpression(createIdentifierExpression(CREATE_CALLBACK),
                    createArgumentList(createNumberLiteral(callbackState))),
                createCallExpression(createIdentifierExpression(CREATE_ERRBACK),
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
          createIdentifierExpression($VALUE)));
    } else {
      assignment = createStatementList();
    }
    states.push(new FallThroughState(callbackState, fallThroughState, assignment));
    //  case errbackState:
    //    throw $err;
    states.push(new FallThroughState(errbackState, fallThroughState, createStatementList(
        createThrowStatement(createIdentifierExpression(ERR)))));

    return new StateMachine(createTaskState, fallThroughState, states, []);
  }

  /**
   * @param {Finally} tree
   * @return {ParseTree}
   */
  transformFinally(tree) {
    var result = super.transformFinally(tree);
    if (result.block.type != STATE_MACHINE) {
      return result;
    }
    // TODO: is this a reasonable restriction?
    this.reporter.reportError(tree.location.start, 'async not permitted within a finally block.');
    return result;
  }

  /**
   * @param {ReturnStatement} tree
   * @return {ParseTree}
   */
  transformReturnStatement(tree) {
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
  }

  /**
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  createCompleteTask_(result) {
    return createCallStatement(
        createMemberExpression(RESULT, CALLBACK), createArgumentList(result));
  }

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
   * @param {FunctionBody} tree
   * @return {FunctionBody}
   */
  transformAsyncBody(tree) {
    // transform to a state machine
    var transformedTree = this.transformAny(tree);
    if (this.reporter.hadError()) {
      return tree;
    }
    var machine = transformedTree;

    var statements = [];

    //   var $that = this;
    statements.push(this.generateHoistedThis());
    // var $arguments = arguments;
    statements.push(this.generateHoistedArguments());
    //     lifted machine variables
    statements.push(...this.getMachineVariables(tree, machine));
    //   var $value;
    statements.push(createVariableStatement(
        VAR,
        $VALUE,
        null));
    //   var $err;
    statements.push(createVariableStatement(
        VAR,
        ERR,
        null));
    // TODO: var $cancel = ...;
    //   var $result = new Deferred();
    statements.push(createVariableStatement(
        VAR,
        RESULT,
        createNewExpression(
            createIdentifierExpression(DEFERRED),
            createEmptyArgumentList())));
    //   var $waitTask;
    statements.push(createVariableStatement(
        VAR,
        WAIT_TASK,
        null));
    var id = createIdentifierExpression;
    var G = '$G';
    statements.push(
        parseStatement `
        var ${G} = {
          GState: 0,
          current: undefined,
          yieldReturn: undefined,
          innerFunction: ${this.generateMachineInnerFunction(machine)},
          moveNext: ${this.generateMachineMethod(machine)}
        };
        `);
    //   var $continuation = $G.moveNext.bind($G);
    statements.push(
        parseStatement `
        var ${id(CONTINUATION)} = ${id(G)}.moveNext.bind(${id(G)});`);
    //   var $createCallback = function(newState) { return function (value) { $state = newState; $value = value; $continuation(); }}
    statements.push(createVariableStatement(
        VAR,
        CREATE_CALLBACK,
        createFunctionExpression(
            createParameterList(NEW_STATE),
            createFunctionBody([
                createReturnStatement(
                    createFunctionExpression(
                        createParameterList(1),
                        createFunctionBody([
                            createAssignmentStatement(
                                createIdentifierExpression(STATE),
                                createIdentifierExpression(NEW_STATE)),
                                createAssignmentStatement(
                                    createIdentifierExpression($VALUE),
                                    createParameterReference(0)),
                                createCallStatement(createIdentifierExpression(CONTINUATION))])))]))));
    //   var $createErrback = function(newState) { return function (err) { $state = newState; $err = err; $continuation(); }}
    statements.push(createVariableStatement(
        VAR,
        CREATE_ERRBACK,
        createFunctionExpression(
            createParameterList(NEW_STATE),
            createFunctionBody([
                createReturnStatement(
                    createFunctionExpression(
                        createParameterList(1),
                        createFunctionBody([
                            createAssignmentStatement(
                                createIdentifierExpression(STATE),
                                createIdentifierExpression(NEW_STATE)),
                                createAssignmentStatement(
                                    createIdentifierExpression(ERR),
                                    createParameterReference(0)),
                                createCallStatement(createIdentifierExpression(CONTINUATION))])))]))));
    //  $continuation();
    statements.push(createCallStatement(createIdentifierExpression(CONTINUATION)));
    //  return $result.createPromise();
    statements.push(createReturnStatement(
        createCallExpression(
            createMemberExpression(RESULT, CREATE_PROMISE))));

    return createFunctionBody(statements);
  }

  /**
   * @param {number} rethrowState
   * @param {number} machineEndState
   * @return {Array.<ParseTree>}
   */
  machineUncaughtExceptionStatements(rethrowState, machineEndState) {
    return createStatementList(
        createAssignStateStatement(rethrowState),
        createBreakStatement());
  }

  /** @return {Array.<ParseTree>} */
  machineEndStatements() {
    // return;
    return createStatementList(createReturnStatement(null));
  }

  /**
   * @param {number} machineEndState
   * @return {Array.<ParseTree>}
   */
  machineFallThroughStatements(machineEndState) {
    // $waitTask.callback(undefined);
    // $state = machineEndState;
    // break;
    return createStatementList(
        this.createCompleteTask_(createUndefinedExpression()),
        createAssignStateStatement(machineEndState),
        createBreakStatement());
  }

  /**
   * @param {number} machineEndState
   * @return {Array.<ParseTree>}
   */
  machineRethrowStatements(machineEndState) {
    return createStatementList(
        // $result.errback($storedException);
        createCallStatement(
        createMemberExpression(RESULT, ERRBACK),
        createArgumentList(createIdentifierExpression(STORED_EXCEPTION))),
        // $state = machineEndState
        createAssignStateStatement(machineEndState),
        // break;
        createBreakStatement());
  }
}

/**
 * @param {ErrorReporter} reporter
 * @param {Block} body
 * @return {Block}
 */
AsyncTransformer.transformAsyncBody = function(reporter, body) {
  return new AsyncTransformer(reporter).transformAsyncBody(body);
};

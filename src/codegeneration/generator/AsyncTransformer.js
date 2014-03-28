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

import {AwaitState} from './AwaitState';
import {
  BinaryOperator,
  ExpressionStatement,
  IdentifierExpression
} from '../../syntax/trees/ParseTrees';
import {CPSTransformer} from './CPSTransformer';
import {EndState} from './EndState';
import {FallThroughState} from './FallThroughState';
import {
  AWAIT_EXPRESSION,
  BINARY_OPERATOR,
  STATE_MACHINE
} from '../../syntax/trees/ParseTreeType';
import {
  parseExpression,
  parseStatement,
  parseStatements
} from '../PlaceholderParser';
import {State} from './State';
import {StateMachine} from '../../syntax/trees/StateMachine';
import {
  EQUAL,
  VAR
} from '../../syntax/TokenType';
import {FindInFunctionScope} from '../FindInFunctionScope'
import {
  createAssignStateStatement,
  createBreakStatement,
  createOperatorToken,
  createReturnStatement,
  createStatementList,
  createUndefinedExpression
} from '../ParseTreeFactory';

/**
 * @param {ParseTree} tree Expression tree
 * @return {boolean}
 */
function isAwaitAssign(tree) {
  return tree.type === BINARY_OPERATOR &&
      tree.operator.isAssignmentOperator() &&
      tree.right.type === AWAIT_EXPRESSION &&
      tree.left.isLeftHandSideExpression();
}

class AwaitFinder extends FindInFunctionScope {
  visitAwaitExpression(tree) {
    this.found = true;
  }
}

function scopeContainsAwait(tree) {
  return new AwaitFinder(tree).found;
}

/**
 * Desugars async function bodies. Async function bodies contain 'async' statements.
 *
 * At the top level the state machine is translated into this source code:
 *
 * {
 *   machine variables
 *   return $traceurRuntime.asyncWrap(machineFunction);
 * }
 */
export class AsyncTransformer extends CPSTransformer {

  expressionNeedsStateMachine(tree) {
    if (tree === null)
      return false;
    return scopeContainsAwait(tree);
  }

  transformExpressionStatement(tree) {
    var expression = tree.expression;
    if (expression.type === AWAIT_EXPRESSION)
      return this.transformAwaitExpression_(expression);

    if (isAwaitAssign(expression))
      return this.transformAwaitAssign_(expression);

    if (this.expressionNeedsStateMachine(expression)) {
       return this.expressionToStateMachine(expression).machine;
    }

    return super.transformExpressionStatement(tree);
  }

  transformAwaitExpression(tree) {
    throw new Error('Internal error');
  }

  transformAwaitExpression_(tree) {
    return this.transformAwait_(tree, tree.expression, null, null);
  }

  transformAwaitAssign_(tree) {
    return this.transformAwait_(tree, tree.right.expression, tree.left,
                                tree.operator);
  }

  transformAwait_(tree, expression, left, operator) {
    var createTaskState = this.allocateState();
    var callbackState = this.allocateState();
    var fallThroughState = this.allocateState();
    if (!left)
      callbackState = fallThroughState;

    var states = [];
    var expression = this.transformAny(expression);
    //  case createTaskState:
    states.push(new AwaitState(createTaskState, callbackState, expression));

    //  case callbackState:
    //    identifier = $ctx.value;
    //    $ctx.state = fallThroughState;
    //    break;
    if (left) {
      var statement = new ExpressionStatement(
          tree.location,
          new BinaryOperator(
              tree.location,
              left,
              operator,
              parseExpression `$ctx.value`));
      var assignment = [statement];
      states.push(new FallThroughState(callbackState, fallThroughState,
                                       assignment));
    }

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
    this.reporter.reportError(tree.location.start,
        'await not permitted within a finally block.');
    return result;
  }

  /**
   * @param {ReturnStatement} tree
   * @return {ParseTree}
   */
  transformReturnStatement(tree) {
    var expression, machine;
    if (this.expressionNeedsStateMachine(tree.expression)) {
      ({expression, machine} = this.expressionToStateMachine(tree.expression));
    } else {
      expression = tree.expression || createUndefinedExpression();
    }

    var startState = this.allocateState();
    var endState = this.allocateState();
    var completeState = new FallThroughState(startState, endState,
        // $ctx.result.callback(expression);
        createStatementList(this.createCompleteTask_(expression)));
    var end = new EndState(endState);
    var returnMachine = new StateMachine(
        startState,
        // TODO: this should not be required, but removing requires making consumers resilient
        // TODO: to INVALID fallThroughState
        this.allocateState(),
        [completeState, end],
        []);

    if (machine)
      returnMachine = machine.append(returnMachine);
    return returnMachine;
  }

  /**
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  createCompleteTask_(result) {
    return parseStatement `$ctx.resolve(${result})`;
  }

  /**
   * Transform an async function body - removing async statements.
   * The transformation is in two stages. First the statements are converted into a single
   * state machine by merging state machines via a bottom up traversal.
   *
   * Then the final state machine is converted into the following code:
   *
   * {
   *   machine variables
   *   return $traceurRuntime.asyncWrap(machineFunction);
   * }
   * @param {FunctionBody} tree
   * @return {FunctionBody}
   */
  transformAsyncBody(tree) {
    var runtimeFunction = parseExpression `$traceurRuntime.asyncWrap`;
    return this.transformCpsFunctionBody(tree, runtimeFunction);
  }

  /**
   * @param {number} machineEndState
   * @return {Array.<ParseTree>}
   */
  machineFallThroughStatements(machineEndState) {
    // $ctx.waitTask.callback(undefined);
    // $ctx.state = machineEndState;
    // break;
    return createStatementList(
        this.createCompleteTask_(createUndefinedExpression()),
        createAssignStateStatement(machineEndState),
        createBreakStatement());
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ErrorReporter} reporter
   * @param {Block} body
   * @return {Block}
   */
  static transformAsyncBody(identifierGenerator, reporter, body) {
    return new AsyncTransformer(identifierGenerator, reporter).
        transformAsyncBody(body);
  }
};

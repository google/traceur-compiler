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
import {
  STATE_MACHINE,
  YIELD_EXPRESSION
} from '../../syntax/trees/ParseTreeType';
import {
  BinaryOperator,
  ExpressionStatement
} from '../../syntax/trees/ParseTrees'
import {ExplodeExpressionTransformer} from '../ExplodeExpressionTransformer';
import {FallThroughState} from './FallThroughState';
import {ReturnState} from './ReturnState';
import {State} from './State';
import {StateMachine} from '../../syntax/trees/StateMachine';
import {YieldState} from './YieldState';
import {
  createAssignStateStatement,
  createFunctionBody,
  createIdentifierExpression as id,
  createMemberExpression,
  createStatementList,
  createUndefinedExpression,
  createYieldStatement
} from '../ParseTreeFactory';
import isYieldAssign from './isYieldAssign';
import {
  parseExpression,
  parseStatement,
  parseStatements
} from '../PlaceholderParser';
import scopeContainsYield from './scopeContainsYield';

/**
 * Desugars generator function bodies. Generator function bodies contain
 * 'yield' statements.
 *
 * At the top level the state machine is translated into this source code:
 *
 * {
 *   machine variables
 *   return $traceurRuntime.generatorWrap(machineFunction);
 * }
 */
export class GeneratorTransformer extends CPSTransformer {

  constructor(identifierGenerator, reporter) {
    super(identifierGenerator, reporter);
    this.shouldAppendThrowCloseState_ = true;
  }

  expressionNeedsStateMachine(tree) {
    if (tree === null)
      return false;
    return scopeContainsYield(tree);
  }


  /**
   * Simple form yield expressions (direct children of an ExpressionStatement)
   * are translated into a state machine with a single state.
   * @param {YieldExpression} tree
   * @return {ParseTree}
   * @private
   */
  transformYieldExpression_(tree) {
    var expression, machine;
    if (this.expressionNeedsStateMachine(tree.expression)) {
      ({expression, machine} = this.expressionToStateMachine(tree.expression));
    } else {
      expression = this.transformAny(tree.expression);
      if (!expression)
        expression = createUndefinedExpression();
    }

    if (tree.isYieldFor)
      return this.transformYieldForExpression_(expression, machine);

    var startState = this.allocateState();
    var fallThroughState = this.allocateState();
    var yieldMachine = this.stateToStateMachine_(
        new YieldState(
            startState,
            fallThroughState,
            this.transformAny(expression)),
        fallThroughState);

    if (machine)
      yieldMachine = machine.append(yieldMachine);

    // The yield expression we generated for the yield-for expression should not
    // be followed by the ThrowCloseState since the inner iterator need to
    // handle the throw case.
    if (this.shouldAppendThrowCloseState_)
      yieldMachine = yieldMachine.append(this.createThrowCloseState_());

    return yieldMachine;
  }

  transformYieldForExpression_(expression, machine = undefined) {
    var gName = this.getTempIdentifier();
    this.addMachineVariable(gName);
    var g = id(gName);

    var nextName = this.getTempIdentifier();
    this.addMachineVariable(nextName);
    var next = id(nextName);

    // http://wiki.ecmascript.org/doku.php?id=harmony:generators
    // Updated on es-discuss
    //
    // The expression yield* <<expr>> is equivalent to:
    //
    // let (g = EXPR) {
    //   let received = void 0, send = true;
    //   for (;;) {
    //     let next = send ? g.next(received) : g.throw(received);
    //     if (next.done)
    //       break;
    //     try {
    //       received = yield next.value;  // ***
    //       send = true;
    //     } catch (e) {
    //       received = e;
    //       send = false;
    //     }
    //   }
    //   next.value;
    // }

    var statements = parseStatements `
        ${g} = ${expression}[Symbol.iterator]();
        // received = void 0;
        $ctx.sent = void 0;
        // send = true; // roughly equivalent
        $ctx.action = 'next';

        for (;;) {
          ${next} = ${g}[$ctx.action]($ctx.sentIgnoreThrow);
          if (${next}.done) {
            $ctx.sent = ${next}.value;
            break;
          }
          ${createYieldStatement(createMemberExpression(next, 'value'))};
        }`;

    // The yield above should not be treated the same way as a normal yield.
    // See comment in transformYieldExpression_.
    var shouldAppendThrowCloseState = this.shouldAppendThrowCloseState_;
    this.shouldAppendThrowCloseState_ = false;
    statements = this.transformList(statements);
    var yieldMachine = this.transformStatementList_(statements);
    this.shouldAppendThrowCloseState_ = shouldAppendThrowCloseState;

    if (machine)
      yieldMachine = machine.append(yieldMachine);

    // TODO(arv): Another option is to build up the statemachine for this here
    // instead of builing the code and transforming the code into a state
    // machine.

    return yieldMachine;
  }

  /**
   * @param {YieldExpression} tree
   * @return {ParseTree}
   */
  transformYieldExpression(tree) {
    this.reporter.reportError(tree.location.start,
        'Only \'a = yield b\' and \'var a = yield b\' currently supported.');
    return tree;
  }

  /**
   * @param {BinaryOperator} tree
   */
  transformYieldAssign_(tree) {
    var shouldAppendThrowCloseState = this.shouldAppendThrowCloseState_;
    this.shouldAppendThrowCloseState_ = false;
    var machine = this.transformYieldExpression_(tree.right);
    var left = this.transformAny(tree.left);
    var sentExpression = tree.right.isYieldFor ?
        parseExpression `$ctx.sentIgnoreThrow` :
        parseExpression `$ctx.sent`;
    var statement = new ExpressionStatement(
        tree.location,
        new BinaryOperator(
            tree.location,
            left,
            tree.operator,
            sentExpression));
    var assignMachine = this.statementToStateMachine_(statement);
    this.shouldAppendThrowCloseState_ = shouldAppendThrowCloseState;
    return machine.append(assignMachine);
  }

  createThrowCloseState_() {
    return this.statementToStateMachine_(parseStatement `$ctx.maybeThrow()`);
  }

  /**
   * @param {ExpressionStatement} tree
   * @return {ParseTree}
   */
  transformExpressionStatement(tree) {
    var expression = tree.expression;
    if (expression.type === YIELD_EXPRESSION)
      return this.transformYieldExpression_(expression);

    if (isYieldAssign(expression))
      return this.transformYieldAssign_(expression);

    if (this.expressionNeedsStateMachine(expression)) {
       return this.expressionToStateMachine(expression).machine;
    }

    return super.transformExpressionStatement(tree);
  }

  /**
   * @param {AwaitStatement} tree
   * @return {ParseTree}
   */
  transformAwaitStatement(tree) {
    // TODO(arv): This should be handled in the parser... change to throw.
    this.reporter.reportError(tree.location.start,
        'Generator function may not have an await statement.');
    return tree;
  }

  /**
   * @param {ReturnStatement} tree
   * @return {ParseTree}
   */
  transformReturnStatement(tree) {
    var expression, machine;

    if (this.expressionNeedsStateMachine(tree.expression))
      ({expression, machine} = this.expressionToStateMachine(tree.expression));
    else
      expression = tree.expression;

    var startState = this.allocateState();
    var fallThroughState = this.allocateState();
    var returnMachine = this.stateToStateMachine_(
        new ReturnState(
            startState,
            fallThroughState,
            this.transformAny(expression)),
        fallThroughState);

    if (machine)
      return machine.append(returnMachine);
    return returnMachine
  }

  /**
   * Transform a generator function body - removing yield statements.
   * The transformation is in two stages. First the statements are converted
   * into a single state machine by merging state machines via a bottom up
   * traversal.
   *
   * Then the final state machine is converted into the following code:
   *
   * {
   *   machine variables
   *   return generatorWrap(machineFunction);
   * }
   *
   * @param {FunctionBody} tree
   * @return {FunctionBody}
   */
  transformGeneratorBody(tree) {
    var runtimeFunction = parseExpression `$traceurRuntime.generatorWrap`;
    return this.transformCpsFunctionBody(tree, runtimeFunction);
  }

  /**
   * @param {number} machineEndState
   * @return {Array.<ParseTree>}
   */
  machineFallThroughStatements(machineEndState) {
    return createStatementList(createAssignStateStatement(machineEndState));
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ErrorReporter} reporter
   * @param {Block} body
   * @return {Block}
   */
  static transformGeneratorBody(identifierGenerator, reporter, body) {
    return new GeneratorTransformer(identifierGenerator, reporter).
        transformGeneratorBody(body);
  }
};

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
import {ExplodeExpressionTransformer} from '../ExplodeExpressionTransformer';

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
    this.inYieldFor_ = false;
  }

  /**
   * Simple form yield expressions (direct children of an ExpressionStatement)
   * are translated into a state machine with a single state.
   * @param {YieldExpression} tree
   * @return {ParseTree}
   * @private
   */
  transformYieldExpression_(tree) {
    var expression = this.transformAny(tree.expression);
    if (!expression)
      expression = createUndefinedExpression();

    if (tree.isYieldFor)
      return this.transformYieldForExpression_(expression);

    var startState = this.allocateState();
    var fallThroughState = this.allocateState();
    var machine = this.stateToStateMachine_(
        new YieldState(
            startState,
            fallThroughState,
            this.transformAny(expression)),
        fallThroughState);

    // The yield expression we generated for the yield-for expression should not
    // be followed by the ThrowCloseState since the inner iterator need to
    // handle the throw case.
    if (this.inYieldFor_)
      return machine;

    return machine.append(this.createThrowCloseState_());
  }

  transformYieldForExpression_(expression) {
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
          ${next} = ${g}[$ctx.action]($ctx.sent);
          if (${next}.done) {
            $ctx.sent = ${next}.value;
            break;
          }
          ${createYieldStatement(createMemberExpression(next, 'value'))};
        }`;

    // The yield above should not be treated the same way as a normal yield.
    // See comment in transformYieldExpression_.
    var wasInYieldFor = this.inYieldFor_;
    this.inYieldFor_ = true;
    statements = this.transformList(statements);
    this.inYieldFor_ = wasInYieldFor;
    var machine = this.transformStatementList_(statements);

    // TODO(arv): Another option is to build up the statemachine for this here
    // instead of builing the code and transforming the code into

    return machine;
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
    var machine = this.transformYieldExpression_(tree.right);
    var left = this.transformAny(tree.left);
    var statement = new ExpressionStatement(
        tree.location,
        new BinaryOperator(
            tree.location,
            left,
            tree.operator,
            parseExpression `$ctx.sent`));
    var assignMachine = this.statementToStateMachine_(statement);
    return machine.append(assignMachine);
  }

  createThrowCloseState_() {
    return this.statementToStateMachine_(parseStatement `
        if ($ctx.action === 'throw') {
          $ctx.action = 'next';
          throw $ctx.sent;
        }`);
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

    return super.transformExpressionStatement(tree);
  }

  /**
   * @param {AwaitStatement} tree
   * @return {ParseTree}
   */
  transformAwaitStatement(tree) {
    this.reporter.reportError(tree.location.start,
        'Generator function may not have an await statement.');
    return tree;
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
    // TODO: Is 'return' allowed inside 'finally'?
    this.reporter.reportError(tree.location.start,
        'yield or return not permitted from within a finally block.');
    return result;
  }

  /**
   * @param {ReturnStatement} tree
   * @return {ParseTree}
   */
  transformReturnStatement(tree) {
    var startState = this.allocateState();
    var fallThroughState = this.allocateState();
    return this.stateToStateMachine_(
        new ReturnState(
            startState,
            fallThroughState,
            this.transformAny(tree.expression)),
        fallThroughState);
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
  machineRethrowStatements(machineEndState) {
    return parseStatements `throw $ctx.storedException`;
  }

  /**
   * @param {number} machineEndState
   * @return {Array.<ParseTree>}
   */
  machineFallThroughStatements(machineEndState) {
    return createStatementList(createAssignStateStatement(machineEndState));
  }

  /** @return {Array.<ParseTree>} */
  machineEndStatements() {
    return parseStatements `return $ctx`;
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

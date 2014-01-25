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
  parseExpression,
  parseStatement,
  parseStatements
} from '../PlaceholderParser';
import {FallThroughState} from './FallThroughState';
import {ReturnState} from './ReturnState';
import {State} from './State';
import {StateMachine} from '../../syntax/trees/StateMachine';
import {YieldState} from './YieldState';
import {
  createAssignStateStatement,
  createFunctionBody,
  createStatementList,
  createUndefinedExpression
} from '../ParseTreeFactory';

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
  /**
   * Simple form yield expressions (direct children of an ExpressionStatement)
   * are translated into a state machine with a single state.
   * @param {YieldExpression} tree
   * @return {ParseTree}
   * @private
   */
  transformYieldExpression_(tree) {
    var e = tree.expression || createUndefinedExpression();

    var startState = this.allocateState();
    var fallThroughState = this.allocateState();
    return this.stateToStateMachine_(
        new YieldState(
            startState,
            fallThroughState,
            this.transformAny(e)),
        fallThroughState);
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
   * @param {ExpressionStatement} tree
   * @return {ParseTree}
   */
  transformExpressionStatement(tree) {
    var e = tree.expression;
    if (e.type === YIELD_EXPRESSION)
      return this.transformYieldExpression_(e);

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
   * @param {ErrorReporter} reporter
   * @param {Block} body
   * @return {Block}
   */
  static transformGeneratorBody(reporter, body) {
    return new GeneratorTransformer(reporter).transformGeneratorBody(body);
  }
};

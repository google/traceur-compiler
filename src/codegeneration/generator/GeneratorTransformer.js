// Copyright 2012 Google Inc.
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

import CPSTransformer from 'CPSTransformer.js';
import EndState from 'EndState.js';
import {
  MARK_AS_GENERATOR,
  MOVE_NEXT,
  RESULT,
  RUNTIME,
  STORED_EXCEPTION,
  TRACEUR
} from '../../syntax/PredefinedName.js';
import {
  STATE_MACHINE,
  YIELD_EXPRESSION
} from '../../syntax/trees/ParseTreeType.js';
import StateMachine from '../../syntax/trees/StateMachine.js';
import TokenType from '../../syntax/TokenType.js';
import YieldState from 'YieldState.js';
import {
  createArgumentList,
  createAssignStateStatement,
  createAssignmentStatement,
  createBlock,
  createCallExpression,
  createEmptyParameterList,
  createExpressionStatement,
  createFalseLiteral,
  createFunctionExpression,
  createIdentifierExpression,
  createMemberExpression,
  createObjectLiteralExpression,
  createPropertyNameAssignment,
  createReturnStatement,
  createStatementList,
  createStringLiteral,
  createThisExpression,
  createThrowStatement,
  createVariableStatement
} from '../ParseTreeFactory.js';

/**
 * Desugars generator function bodies. Generator function bodies contain 'yield' statements.
 *
 * At the top level the state machine is translated into this source code:
 *
 * {
 *   var $that = this;
 *   machine variables
 *   var $result = { moveNext : machineMethod };
 *   $result[iterator] = function() { return this; };
 *   return $result;
 * }
 */
export class GeneratorTransformer extends CPSTransformer {

  /**
   * Yield statements are translated into a state machine with a single state.
   * As an interim step, we allow this to do double duty transforming simple
   * form yield expressions (direct children of an ExpressionStatement).
   * @param {YieldStatement|YieldExpression} tree
   * @return {ParseTree}
   */
  transformYieldStatement(tree) {
    if (tree.expression != null) {
      var startState = this.allocateState();
      var fallThroughState = this.allocateState();
      return this.stateToStateMachine_(
          new YieldState(
              startState,
              fallThroughState,
              this.transformAny(tree.expression)),
          fallThroughState);
    }
    var stateId = this.allocateState();
    return new StateMachine(
        stateId,
        // TODO: this should not be required, but removing requires making consumers resilient
        // TODO: to INVALID fallThroughState
        this.allocateState(),
        [new EndState(stateId)],
        []);
  }

  /**
   * @param {ExpressionStatement} tree
   * @return {ParseTree}
   */
  transformExpressionStatement(tree) {
    var e = tree.expression;
    if (e.type === YIELD_EXPRESSION)
      return this.transformYieldStatement(e);

    return super.transformExpressionStatement(tree);
  }

  /**
   * @param {AwaitStatement} tree
   * @return {ParseTree}
   */
  transformAwaitStatement(tree) {
    this.reporter.reportError(tree.location.start,
        'Generator function may not have an async statement.');
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
    this.reporter.reportError(tree.location.start, 'yield not permitted from within a finally block.');
    return result;
  }

  /**
   * @param {ReturnStatement} tree
   * @return {ParseTree}
   */
  transformReturnStatement(tree) {
    this.reporter.reportError(tree.location.start,
        'Generator function may not have a return statement.');
    return tree;
  }

  /**
   * Transform a generator function body - removing yield statements.
   * The transformation is in two stages. First the statements are converted into a single
   * state machine by merging state machines via a bottom up traversal.
   *
   * Then the final state machine is converted into the following code:
   *
   * {
   *   var $that = this;
   *   machine variables
   *   var $result = { moveNext : machineMethod };
   *   $result[iterator] = function() { return this; };
   *   return $result;
   * }
   * TODO: add close() method which executes pending finally clauses
   *
   * @param {Block} tree
   * @return {Block}
   */
  transformGeneratorBody(tree) {
    // transform to a state machine
    var transformedTree = this.transformAny(tree);
    if (this.reporter.hadError()) {
      return tree;
    }
    var machine = transformedTree;

    var statements = [];

    // TODO(arv): Simplify the outputted code by only alpha renaming this and
    // arguments if needed.
    // https://code.google.com/p/traceur-compiler/issues/detail?id=108
    //
    // var $that = this;
    statements.push(this.generateHoistedThis());

    // var $arguments = arguments;
    statements.push(this.generateHoistedArguments());

    // TODO(arv): Simplify for the common case where there is no try/catch?
    // https://code.google.com/p/traceur-compiler/issues/detail?id=110
    //
    // Lifted machine variables.
    statements.push(...this.getMachineVariables(tree, machine));

    // TODO(arv): The result should be an instance of Generator.
    // https://code.google.com/p/traceur-compiler/issues/detail?id=109
    //
    // var $result = {moveNext : machineMethod};
    statements.push(createVariableStatement(
        TokenType.VAR,
        RESULT,
        createObjectLiteralExpression(
            createPropertyNameAssignment(
                MOVE_NEXT,
                this.generateMachineMethod(machine)))));

    // traceur.runtime.markAsGenerator($result)
    statements.push(createExpressionStatement(
        createCallExpression(
            createMemberExpression(TRACEUR, RUNTIME, MARK_AS_GENERATOR),
            createArgumentList(createIdentifierExpression(RESULT)))));

    //     return $result;
    statements.push(createReturnStatement(createIdentifierExpression(RESULT)));

    return createBlock(statements);
  }

  /**
   * @param {number} rethrowState
   * @return {Array.<ParseTree>}
   */
  machineUncaughtExceptionStatements(rethrowState) {
    return createStatementList(
        createThrowStatement(createIdentifierExpression(STORED_EXCEPTION)));
  }

  /**
   * @param {number} machineEndState
   * @return {Array.<ParseTree>}
   */
  machineRethrowStatements(machineEndState) {
    return createStatementList(
        createThrowStatement(createIdentifierExpression(STORED_EXCEPTION)));
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
    return [createReturnStatement(createFalseLiteral())];
  }
}

/**
 * @param {ErrorReporter} reporter
 * @param {Block} body
 * @return {Block}
 */
GeneratorTransformer.transformGeneratorBody = function(reporter, body) {
  return new GeneratorTransformer(reporter).transformGeneratorBody(body);
};

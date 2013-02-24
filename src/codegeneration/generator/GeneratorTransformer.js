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

import CPSTransformer from 'CPSTransformer.js';
import EndState from 'EndState.js';
import {
  ACTION_SEND,
  ACTION_THROW,
  ACTION_CLOSE,
  ADD_ITERATOR,
  CURRENT,
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
import parseStatement from '../PlaceholderParser.js';
import StateMachine from '../../syntax/trees/StateMachine.js';
import VAR from '../../syntax/TokenType.js';
import YieldState from 'YieldState.js';
import {
  createArgumentList,
  createAssignStateStatement,
  createAssignmentStatement,
  createBlock,
  createCallExpression,
  createExpressionStatement,
  createFalseLiteral,
  createIdentifierExpression,
  createMemberExpression,
  createNumberLiteral,
  createObjectLiteralExpression,
  createPropertyNameAssignment,
  createReturnStatement,
  createStatementList,
  createThrowStatement,
  createUndefinedExpression,
  createVariableStatement
} from '../ParseTreeFactory.js';

// Generator states. Terminology roughly matches that of
//   http://wiki.ecmascript.org/doku.php?id=harmony:generators
// Since '$state' is already taken, use '$GState' instead to denote what's
// referred to as "G.[[State]]" on that page.
var ST_NEWBORN = 0;
var ST_EXECUTING = 1;
var ST_SUSPENDED = 2;
var ST_CLOSED = 3;
var GSTATE = '$GState';
var $GSTATE = createIdentifierExpression(GSTATE);

/**
 * Desugars generator function bodies. Generator function bodies contain
 * 'yield' statements.
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
    this.reporter.reportError(tree.location.start,
        'yield not permitted from within a finally block.');
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
   * The transformation is in two stages. First the statements are converted
   * into a single state machine by merging state machines via a bottom up
   * traversal.
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

    var $MOVE_NEXT = createIdentifierExpression(MOVE_NEXT);
    var $CURRENT = createIdentifierExpression(CURRENT);

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

    statements.push(
        parseStatement `
        var
          ${$GSTATE} = ${ST_NEWBORN},
          ${$CURRENT},
          ${$MOVE_NEXT} = ${this.generateMachineMethod(machine)}
        `);

    // TODO(arv): The result should be an instance of Generator.
    // https://code.google.com/p/traceur-compiler/issues/detail?id=109
    statements.push(
        // TODO: Look into if this code can be shared between generator
        // instances.
        //
        // TODO: Almost all of these placeholders are constants. Can we do
        // something more efficient in that case?
        parseStatement `
        var $result = {
          send: function(x) {
            switch (${$GSTATE}) {
              case ${ST_EXECUTING}:
                throw new Error('"send" on executing generator');
              case ${ST_CLOSED}:
                throw new Error('"send" on closed generator');
              case ${ST_NEWBORN}:
                if (x !== undefined) {
                  throw new TypeError('Sent value to newborn generator');
                }
                // fall through
              case ${ST_SUSPENDED}:
                ${$GSTATE} = ${ST_EXECUTING};
                if (${$MOVE_NEXT}(x, ${ACTION_SEND})) {
                  ${$GSTATE} = ${ST_SUSPENDED};
                  return ${$CURRENT};
                }
                ${$GSTATE} = ${ST_CLOSED};
                throw traceur.runtime.StopIteration;
            }
          },

          next: function() {
            return this.send(undefined);
          },

          'throw': function(x) {
            switch (${$GSTATE}) {
              case ${ST_EXECUTING}:
                throw new Error('"throw" on executing generator');
              case ${ST_CLOSED}:
                throw new Error('"throw" on closed generator');
              case ${ST_NEWBORN}:
                ${$GSTATE} = ${ST_CLOSED};
                $state = ${this.machineEndState};
                throw x;
              case ${ST_SUSPENDED}:
                ${$GSTATE} = ${ST_EXECUTING};
                if (${$MOVE_NEXT}(x, ${ACTION_THROW})) {
                  ${$GSTATE} = ${ST_SUSPENDED};
                  return ${$CURRENT};
                }
                ${$GSTATE} = ${ST_CLOSED};
                throw traceur.runtime.StopIteration;
            }
          },

          close: function() {
            switch (${$GSTATE}) {
              case ${ST_EXECUTING}:
                throw new Error('"close" on executing generator');
              case ${ST_CLOSED}:
                return;
              case ${ST_NEWBORN}:
                ${$GSTATE} = ${ST_CLOSED};
                $state = ${this.machineEndState};
                return;
              case ${ST_SUSPENDED}:
                ${$GSTATE} = ${ST_EXECUTING};
                ${$MOVE_NEXT}(undefined, ${ACTION_CLOSE});
                ${$GSTATE} = ${ST_CLOSED};
            }
          }
        };`);

    // traceur.runtime.addIterator($result)
    statements.push(createExpressionStatement(
        createCallExpression(
            createMemberExpression(TRACEUR, RUNTIME, ADD_ITERATOR),
            createArgumentList(createIdentifierExpression(RESULT)))));

    //     return $result;
    statements.push(createReturnStatement(createIdentifierExpression(RESULT)));

    return createBlock(statements);
  }

  /**
   * @param {number} rethrowState
   * @param {number} machineEndState
   * @return {Array.<ParseTree>}
   */
  machineUncaughtExceptionStatements(rethrowState, machineEndState) {
    return createStatementList(
        createAssignmentStatement($GSTATE, createNumberLiteral(ST_CLOSED)),
        createAssignStateStatement(machineEndState),
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
    return [
        createAssignmentStatement($GSTATE, createNumberLiteral(ST_CLOSED)),
        createReturnStatement(createFalseLiteral())];
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

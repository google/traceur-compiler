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
import {
  ACTION_SEND,
  ACTION_THROW,
  RESULT,
  STORED_EXCEPTION,
  TRACEUR_RUNTIME,
  YIELD_RETURN
} from '../../syntax/PredefinedName';
import {
  STATE_MACHINE,
  YIELD_EXPRESSION
} from '../../syntax/trees/ParseTreeType';
import {parseStatement} from '../PlaceholderParser';
import {StateMachine} from '../../syntax/trees/StateMachine';
import {VAR} from '../../syntax/TokenType';
import {YieldState} from './YieldState';
import {ReturnState} from './ReturnState';
import {
  createAssignStateStatement,
  createAssignmentStatement,
  createExpressionStatement,
  createFalseLiteral,
  createFunctionBody,
  createIdentifierExpression as id,
  createMemberExpression,
  createNumberLiteral,
  createObjectLiteralExpression,
  createPropertyNameAssignment,
  createReturnStatement,
  createStatementList,
  createThisExpression,
  createThrowStatement,
  createUndefinedExpression,
  createVariableStatement
} from '../ParseTreeFactory';
import {transformOptions} from '../../options';

// Generator states. Terminology roughly matches that of
//   http://wiki.ecmascript.org/doku.php?id=harmony:generators
// Since '$state' is already taken, use '$GState' instead to denote what's
// referred to as "G.[[State]]" on that page.
var ST_NEWBORN = 0;
var ST_EXECUTING = 1;
var ST_SUSPENDED = 2;
var ST_CLOSED = 3;
var GSTATE = 'GState';

var GENERATOR_WRAP_CODE = `function(generator) {
  return %addIterator({
    next: function(x) {
      switch (generator.GState) {
        case ${ST_EXECUTING}:
          throw new Error('"next" on executing generator');
        case ${ST_CLOSED}:
          throw new Error('"next" on closed generator');
        case ${ST_NEWBORN}:
          if (x !== undefined) {
            throw new TypeError('Sent value to newborn generator');
          }
          // fall through
        case ${ST_SUSPENDED}:
          generator.GState = ${ST_EXECUTING};
          if (generator.moveNext(x, ${ACTION_SEND})) {
            generator.GState = ${ST_SUSPENDED};
            return {value: generator.current, done: false};
          }
          generator.GState = ${ST_CLOSED};
          return {value: generator.yieldReturn, done: true};
      }
    },

    'throw': function(x) {
      switch (generator.GState) {
        case ${ST_EXECUTING}:
          throw new Error('"throw" on executing generator');
        case ${ST_CLOSED}:
          throw new Error('"throw" on closed generator');
        case ${ST_NEWBORN}:
          generator.GState = ${ST_CLOSED};
          throw x;
        case ${ST_SUSPENDED}:
          generator.GState = ${ST_EXECUTING};
          if (generator.moveNext(x, ${ACTION_THROW})) {
            generator.GState = ${ST_SUSPENDED};
            return {value: generator.current, done: false};
          }
          generator.GState = ${ST_CLOSED};
          return {value: generator.yieldReturn, done: true};
      }
    }
  });
}`;

var ADD_ITERATOR_CODE = `function(object) {
  object[%iterator] = %returnThis;
  return %defineProperty(object, %iterator, {enumerable: false});
}`;

var ADD_ITERATOR_RUNTIME_CODE = `function(object) {
  return ${TRACEUR_RUNTIME}.addIterator(object);
}`;

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
   * @param {RuntimeInliner} runtimeInliner
   * @param {ErrorReporter} reporter
   */
  constructor(runtimeInliner, reporter) {
    super(reporter);
    this.runtimeInliner_ = runtimeInliner;
  }

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
   *   var $that = this;
   *   machine variables
   *   var $result = { moveNext : machineMethod };
   *   $result[iterator] = function() { return this; };
   *   return $result;
   * }
   * TODO: add close() method which executes pending finally clauses
   *
   * @param {FunctionBody} tree
   * @return {FunctionBody}
   */
  transformGeneratorBody(tree) {
    // transform to a state machine
    var transformedTree = this.transformAny(tree);
    if (this.reporter.hadError()) {
      return tree;
    }
    var machine = transformedTree;
    machine = new StateMachine(machine.startState,
                               machine.fallThroughState,
                               this.removeEmptyStates(machine.states),
                               machine.exceptionBlocks);

    var statements = [];

    var G = '$G';

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
        var ${G} = {
          GState: ${ST_NEWBORN},
          current: undefined,
          yieldReturn: undefined,
          innerFunction: ${this.generateMachineInnerFunction(machine)},
          moveNext: ${this.generateMachineMethod(machine)}
        };
        `);

    // TODO(arv): The result should be an instance of Generator.
    // https://code.google.com/p/traceur-compiler/issues/detail?id=109
    statements.push(parseStatement `return ${this.generatorWrap_}(${id(G)});`);

    return createFunctionBody(statements);
  }

  get generatorWrap_() {
    if (transformOptions.privateNames)
      this.runtimeInliner_.register('addIterator', ADD_ITERATOR_RUNTIME_CODE);
    else
      this.runtimeInliner_.register('addIterator', ADD_ITERATOR_CODE);
    return this.runtimeInliner_.get('generatorWrap', GENERATOR_WRAP_CODE);
  }

  /**
   * @param {number} rethrowState
   * @param {number} machineEndState
   * @return {Array.<ParseTree>}
   */
  machineUncaughtExceptionStatements(rethrowState, machineEndState) {
    return createStatementList(
        createAssignmentStatement(
            createMemberExpression(createThisExpression(), GSTATE),
            createNumberLiteral(ST_CLOSED)),
        createAssignStateStatement(machineEndState),
        createThrowStatement(id(STORED_EXCEPTION)));
  }

  /**
   * @param {number} machineEndState
   * @return {Array.<ParseTree>}
   */
  machineRethrowStatements(machineEndState) {
    return createStatementList(
        createThrowStatement(id(STORED_EXCEPTION)));
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

  /**
   * @param {RuntimeInliner} runtimeInliner
   * @param {ErrorReporter} reporter
   * @param {Block} body
   * @return {Block}
   */
  static transformGeneratorBody(runtimeInliner, reporter, body) {
    return new GeneratorTransformer(runtimeInliner, reporter).
        transformGeneratorBody(body);
  }
};

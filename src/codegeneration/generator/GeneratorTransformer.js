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
  var EndState = traceur.codegeneration.generator.EndState;
  var YieldState = traceur.codegeneration.generator.YieldState;
  var StateMachine = traceur.syntax.trees.StateMachine;

  var createArgumentList = ParseTreeFactory.createArgumentList;
  var createAssignmentStatement = ParseTreeFactory.createAssignmentStatement;
  var createAssignStateStatement = ParseTreeFactory.createAssignStateStatement;
  var createBlock = ParseTreeFactory.createBlock;
  var createCallExpression = ParseTreeFactory.createCallExpression;
  var createEmptyParameterList = ParseTreeFactory.createEmptyParameterList;
  var createExpressionStatement = ParseTreeFactory.createExpressionStatement;
  var createFalseLiteral = ParseTreeFactory.createFalseLiteral;
  var createFunctionExpression = ParseTreeFactory.createFunctionExpression;
  var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createObjectLiteralExpression = ParseTreeFactory.createObjectLiteralExpression;
  var createPropertyNameAssignment = ParseTreeFactory.createPropertyNameAssignment;
  var createReturnStatement = ParseTreeFactory.createReturnStatement;
  var createStatementList = ParseTreeFactory.createStatementList;
  var createStringLiteral = ParseTreeFactory.createStringLiteral;
  var createThisExpression = ParseTreeFactory.createThisExpression;
  var createThrowStatement = ParseTreeFactory.createThrowStatement;
  var createVariableStatement = ParseTreeFactory.createVariableStatement;

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
   *
   * @param {ErrorReporter} reporter
   * @extends {CPSTransformer}
   * @constructor
   */
  function GeneratorTransformer(reporter) {
    CPSTransformer.call(this, reporter);
  }

  /**
   * @param {ErrorReporter} reporter
   * @param {Block} body
   * @return {Block}
   */
  GeneratorTransformer.transformGeneratorBody = function(reporter, body) {
    return new GeneratorTransformer(reporter).transformGeneratorBody(body);
  };

  GeneratorTransformer.prototype = traceur.createObject(
      CPSTransformer.prototype, {

    /**
     * Yield statements are translated into a state machine with a single state.
     * @param {YieldStatement} tree
     * @return {ParseTree}
     */
    transformYieldStatement: function(tree) {
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
    },

    /**
     * @param {AwaitStatement} tree
     * @return {ParseTree}
     */
    transformAwaitStatement: function(tree) {
      this.reporter.reportError(tree.location.start,
          'Generator function may not have an async statement.');
      return tree;
    },

    /**
     * @param {Finally} tree
     * @return {ParseTree}
     */
    transformFinally: function(tree) {
      var result = CPSTransformer.prototype.transformFinally.call(this, tree);
      if (result.block.type != ParseTreeType.STATE_MACHINE) {
        return result;
      }
      this.reporter.reportError(tree.location.start, 'yield not permitted from within a finally block.');
      return result;
    },

    /**
     * @param {ReturnStatement} tree
     * @return {ParseTree}
     */
    transformReturnStatement: function(tree) {
      this.reporter.reportError(tree.location.start,
          'Generator function may not have a return statement.');
      return tree;
    },

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
    transformGeneratorBody: function(tree) {
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
      statements.push.apply(statements, this.getMachineVariables(tree, machine));

      // TODO(arv): The result should be an instance of Generator.
      // https://code.google.com/p/traceur-compiler/issues/detail?id=109
      //
      // var $result = {moveNext : machineMethod};
      statements.push(createVariableStatement(
          TokenType.VAR,
          PredefinedName.RESULT,
          createObjectLiteralExpression(
              createPropertyNameAssignment(
                  PredefinedName.MOVE_NEXT,
                  this.generateMachineMethod(machine)))));

      // traceur.runtime.markAsGenerator($result)
      statements.push(createExpressionStatement(
          createCallExpression(
              createMemberExpression(PredefinedName.TRACEUR,
                                     PredefinedName.RUNTIME,
                                     PredefinedName.MARK_AS_GENERATOR),
              createArgumentList(
                  createIdentifierExpression(PredefinedName.RESULT)))));

      //     return $result;
      statements.push(createReturnStatement(createIdentifierExpression(PredefinedName.RESULT)));

      return createBlock(statements);
    },

    /**
     * @param {number} rethrowState
     * @return {Array.<ParseTree>}
     */
    machineUncaughtExceptionStatements: function(rethrowState) {
      return createStatementList(
          createThrowStatement(createIdentifierExpression(PredefinedName.STORED_EXCEPTION)));
    },

    /**
     * @param {number} machineEndState
     * @return {Array.<ParseTree>}
     */
    machineRethrowStatements: function(machineEndState) {
      return createStatementList(
          createThrowStatement(createIdentifierExpression(PredefinedName.STORED_EXCEPTION)));
    },

    /**
     * @param {number} machineEndState
     * @return {Array.<ParseTree>}
     */
    machineFallThroughStatements: function(machineEndState) {
      return createStatementList(createAssignStateStatement(machineEndState));
    },

    /** @return {Array.<ParseTree>} */
    machineEndStatements: function() {
      return [createReturnStatement(createFalseLiteral())];
    }
  });

  return {
    GeneratorTransformer: GeneratorTransformer
  };
});

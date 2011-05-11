// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

traceur.define('codegeneration.generator', function() {
  'use strict';

  var PredefinedName = traceur.syntax.PredefinedName;
  var State = traceur.codegeneration.generator.State;
  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var createAssignmentStatement = ParseTreeFactory.createAssignmentStatement;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createReturnStatement = ParseTreeFactory.createReturnStatement;
  var createTrueLiteral = ParseTreeFactory.createTrueLiteral;

  /**
   * Represents the dispatch portion of a switch statement that has been added
   * to a StateMachine.
   *
   * SwitchStates are immutable.
   *
   * @param {number} id
   * @param {number} fallThroughState
   * @param {ParseTree} expression
   * @constructor
   * @extends {State}
   */
  function YieldState(id, fallThroughState, expression) {
    State.call(this, id);
    this.fallThroughState = fallThroughState;
    this.expression = expression;
  }

  YieldState.prototype = traceur.createObject(State.prototype, {

    /**
     * @param {number} oldState
     * @param {number} newState
     * @return {YieldState}
     */
    replaceState: function(oldState, newState) {
      return new YieldState(
          State.replaceStateId(this.id, oldState, newState),
          State.replaceStateId(this.fallThroughState, oldState, newState),
          this.expression);
    },

    /**
     * @param {FinallyState} enclosingFinally
     * @param {number} machineEndState
     * @param {ErrorReporter} reporter
     * @return {Array.<ParseTree>}
     */
    transform: function(enclosingFinally, machineEndState, reporter) {
      var result = [];
      // $result.current = expression;
      result.push(createAssignmentStatement(
          createMemberExpression(
              PredefinedName.RESULT,
              PredefinedName.CURRENT),
          this.expression));
      // either:
      //      $state = this.fallThroughState;
      //      return true;
      // or:
      //      $state = enclosingFinally.finallyState;
      //      $fallThrough = this.fallThroughState;
      //      return true;
      result.push.apply(result,
          State.generateAssignState(enclosingFinally, this.fallThroughState));
      result.push(createReturnStatement(createTrueLiteral()));
      return result;
    }
  });

  return {
    YieldState: YieldState
  };
});

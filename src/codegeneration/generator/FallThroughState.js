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

  var State = traceur.codegeneration.generator.State;

  /**
   * @param {number} id
   * @param {number} fallThroughState
   * @param {Array.<ParseTree>} statements
   * @constructor
   * @extends {State}
   */
  function FallThroughState(id, fallThroughState, statements) {
    State.call(this, id);
    this.fallThroughState = fallThroughState;
    this.statements = statements;
  }

  FallThroughState.prototype = traceur.createObject(State.prototype, {

    /**
     * @param {number} oldState
     * @param {number} newState
     * @return {FallThroughState}
     */
    replaceState: function(oldState, newState) {
      return new FallThroughState(
          State.replaceStateId(this.id, oldState, newState),
          State.replaceStateId(this.fallThroughState, oldState, newState),
          this.statements);
    },

    /**
     * @param {FinallyState} enclosingFinally
     * @param {number} machineEndState
     * @param {ErrorReporter} reporter
     * @return {Array.<ParseTree>}
     */
    transform: function(enclosingFinally, machineEndState, reporter) {
      var statements = [];
      statements.push.apply(statements, this.statements);
      statements.push.apply(statements,
          State.generateJump(enclosingFinally, this.fallThroughState));
      return statements;
    }
  });

  return {
    FallThroughState: FallThroughState
  };
});

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
  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var createBlock = ParseTreeFactory.createBlock;
  var createIfStatement = ParseTreeFactory.createIfStatement;

  /**
   * @param {number} id
   * @param {number} ifState
   * @param {number} elseState
   * @param {ParseTree} condition
   * @constructor
   * @extends {State}
   */
  function ConditionalState(id, ifState, elseState, condition) {
    State.call(this, id);
    this.ifState = ifState;
    this.elseState = elseState;
    this.condition = condition;
  }

  ConditionalState.prototype = traceur.createObject(State.prototype, {

    /**
     * Represents the dispatch portion of an if/else block.
     * ConditionalStates are immutable.
     *
     * @param {number} oldState
     * @param {number} newState
     * @return {ConditionalState}
     */
    replaceState: function(oldState, newState) {
      return new ConditionalState(
          State.replaceStateId(this.id, oldState, newState),
          State.replaceStateId(this.ifState, oldState, newState),
          State.replaceStateId(this.elseState, oldState, newState),
          this.condition);
    },

    /**
     * @param {FinallyState} enclosingFinally
     * @param {number} machineEndState
     * @param {ErrorReporter} reporter
     * @return {Array.<ParseTree>}
     */
    transform: function(enclosingFinally, machineEndState, reporter) {
      return [
        createIfStatement(this.condition,
            createBlock(State.generateJump(enclosingFinally, this.ifState)),
            createBlock(State.generateJump(enclosingFinally, this.elseState)))];
    }
  });

  return {
    ConditionalState: ConditionalState
  };
});

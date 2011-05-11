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
  var FallThroughState = traceur.codegeneration.generator.FallThroughState;
  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var createStatementList = ParseTreeFactory.createStatementList;

  /**
   * @param {number} id
   * @param {string} label
   * @constructor
   * @extends {State}
   */
  function ContinueState(id, label) {
    State.call(this, id);
    this.label = label;
  }

  ContinueState.prototype = traceur.createObject(State.prototype, {

    /**
     * @param {number} oldState
     * @param {number} newState
     * @return {ContinueState}
     */
    replaceState: function(oldState, newState) {
      return new ContinueState(State.replaceStateId(this.id, oldState, newState), this.label);
    },

    /**
     * @param {FinallyState} enclosingFinally
     * @param {number} machineEndState
     * @param {ErrorReporter} reporter
     * @return {Array.<ParseTree>}
     */
    transform: function(enclosingFinally, machineEndState, reporter) {
      throw new Error('These should be removed before the transform step');
    },

    /**
     * @param {Object} labelSet
     * @param {number} breakState
     * @param {number} continueState
     * @return {State}
     */
    transformBreakOrContinue: function(labelSet, breakState, continueState) {
      if (this.label == null || this.label in labelSet) {
        return new FallThroughState(this.id, continueState, createStatementList());
      }
      return this;
    }
  });

  return {
    ContinueState: ContinueState
  };
});

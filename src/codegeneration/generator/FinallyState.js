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
  var TryState = traceur.codegeneration.generator.TryState;

  /**
   * Represents the dispatch portion of a try/catch block in a state machine.
   * @param {number} finallyState
   *    The beginning of the finally block of the try/finally.
   * @param {number} fallThroughState
   *    A state reached only by falling off of the end of the finally block of the try/finally.
   * @param {Array.<number>} allStates
   * @param {TryState} nestedTrys
   * @extends {TryState}
   * @constructor
   */
  function FinallyState(finallyState, fallThroughState, allStates, nestedTrys) {
    TryState.call(this, TryState.Kind.FINALLY, allStates, nestedTrys);

    this.finallyState = finallyState;
    this.fallThroughState = fallThroughState;
  }

  FinallyState.prototype = traceur.createObject(TryState.prototype, {

    /**
     * @param {number} oldState
     * @param {number} newState
     * @return {FinallyState}
     */
    replaceState: function(oldState, newState) {
      return new FinallyState(
          State.replaceStateId(this.finallyState, oldState, newState),
          State.replaceStateId(this.fallThroughState, oldState, newState),
          this.replaceAllStates(oldState, newState),
          this.replaceNestedTrys(oldState, newState));
    }
  });

  return {
    FinallyState: FinallyState
  };
});

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
   * @param {string} identifier  The name of the exception variable in the catch.
   * @param {number} catchState  The start of the catch portion of the 'try/catch'.
   * @param {number} fallThroughState  The fall through state of the catch portion of the 'try/catch'.
   * @param {Array.<number>} allStates
   * @param {TryState} nestedTrys
   * @extends {TryState}
   * @constructor
   */
  function CatchState(identifier, catchState, fallThroughState, allStates,
      nestedTrys) {
    TryState.call(this, TryState.Kind.CATCH, allStates, nestedTrys);

    this.identifier = identifier;
    this.catchState = catchState;
    this.fallThroughState = fallThroughState;
  }

  CatchState.prototype = traceur.createObject(TryState.prototype, {

    /**
     * @param {number} oldState
     * @param {number} newState
     * @return {CatchState}
     */
    replaceState: function(oldState, newState) {
      return new CatchState(
          this.identifier,
          State.replaceStateId(this.catchState, oldState, newState),
          State.replaceStateId(this.fallThroughState, oldState, newState),
          this.replaceAllStates(oldState, newState),
          this.replaceNestedTrys(oldState, newState));
    }
  });

  return {
    CatchState: CatchState
  };
});

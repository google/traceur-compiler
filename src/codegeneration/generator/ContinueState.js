// Copyright 2012 Traceur Authors.
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

import {FallThroughState} from './FallThroughState';
import {State} from './State';
import {createStatementList} from '../ParseTreeFactory';

export class ContinueState extends State {
  /**
   * @param {number} id
   * @param {string} label
   */
  constructor(id, label) {
    super(id);
    this.label = label;
  }

  /**
   * @param {number} oldState
   * @param {number} newState
   * @return {ContinueState}
   */
  replaceState(oldState, newState) {
    return new ContinueState(State.replaceStateId(this.id, oldState, newState),
                                                  this.label);
  }

  /**
   * @param {FinallyState} enclosingFinally
   * @param {number} machineEndState
   * @param {ErrorReporter} reporter
   * @return {Array.<ParseTree>}
   */
  transform(enclosingFinally, machineEndState, reporter) {
    throw new Error('These should be removed before the transform step');
  }

  /**
   * @param {Object} labelSet
   * @param {number=} breakState
   * @param {number=} continueState
   * @return {State}
   */
  transformBreakOrContinue(labelSet, breakState = undefined,
                           continueState = undefined) {
    if (this.label == null)
      return new FallThroughState(this.id, continueState, []);

    if (this.label in labelSet) {
      return new FallThroughState(this.id, labelSet[this.label].continueState,
                                  []);
    }

    return this;
  }
}

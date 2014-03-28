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

import {State} from './State';
import {parseStatements} from '../PlaceholderParser';

export class AwaitState extends State {
  /**
   * @param {number} id
   * @param {ParseTree} expression
   * @param {number} callbackState
   * @param {Array.<ParseTree>} statements
   */
  constructor(id, callbackState, expression) {
    super(id),
    this.callbackState = callbackState;
    this.expression = expression;
    this.statements_ = null;
  }

  get statements() {
    if (!this.statements_) {
      this.statements_ = parseStatements
          `Promise.resolve(${this.expression}).then(
              $ctx.createCallback(${this.callbackState}), $ctx.errback);
          return`;
    }
    return this.statements_;
  }

  /**
   * @param {number} oldState
   * @param {number} newState
   * @return {AwaitState}
   */
  replaceState(oldState, newState) {
    return new AwaitState(
        State.replaceStateId(this.id, oldState, newState),
        State.replaceStateId(this.callbackState, oldState, newState),
        this.expression);
  }

  /**
   * @param {FinallyState} enclosingFinally
   * @param {number} machineEndState
   * @param {ErrorReporter} reporter
   * @return {Array.<ParseTree>}
   */
  transform(enclosingFinally, machineEndState, reporter) {
    return this.statements;
  }
}


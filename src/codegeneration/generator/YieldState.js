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

import {CURRENT} from '../../syntax/PredefinedName';
import {State} from './State';
import {
  createAssignmentStatement,
  createIdentifierExpression,
  createMemberExpression,
  createReturnStatement,
  createThisExpression,
  createTrueLiteral
} from '../ParseTreeFactory';

/**
 * Represents a simple yield expression that has been added to a StateMachine.
 */
export class YieldState extends State {
  /**
   * @param {number} id
   * @param {number} fallThroughState
   * @param {ParseTree} expression
   */
  constructor(id, fallThroughState, expression) {
    super(id);
    this.fallThroughState = fallThroughState;
    this.expression = expression;
  }

  /**
   * @param {number} oldState
   * @param {number} newState
   * @return {YieldState}
   */
  replaceState(oldState, newState) {
    return new this.constructor(
        State.replaceStateId(this.id, oldState, newState),
        State.replaceStateId(this.fallThroughState, oldState, newState),
        this.expression);
  }

  /**
   * @param {FinallyState} enclosingFinally
   * @param {number} machineEndState
   * @param {ErrorReporter} reporter
   * @return {Array.<ParseTree>}
   */
  transform(enclosingFinally, machineEndState, reporter) {
    return [
      // 'this' refers to the '$G' object from
      // GeneratorTransformer.transformGeneratorBody
      //
      // this.current = expression;
      createAssignmentStatement(
          createMemberExpression(createThisExpression(), CURRENT),
          this.expression),
      // either:
      //      $state = this.fallThroughState;
      //      return true;
      // or:
      //      $state = enclosingFinally.finallyState;
      //      $fallThrough = this.fallThroughState;
      //      return true;
      ...State.generateAssignState(enclosingFinally, this.fallThroughState),
      createReturnStatement(createTrueLiteral())
    ];
  }
}

// Copyright 2013 Traceur Authors.
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

import {
  isUndefined,
  isVoidExpression,
} from '../../semantics/util';
import {YIELD_RETURN} from '../../syntax/PredefinedName';
import {YieldState} from './YieldState';
import {State} from './State';
import {
  createAssignmentStatement,
  createMemberExpression,
  createThisExpression
} from '../ParseTreeFactory';

/**
 * Represents a return statement that has been added to a StateMachine.
 */
export class ReturnState extends YieldState {
  /**
   * @param {FinallyState} enclosingFinally
   * @param {number} machineEndState
   * @param {ErrorReporter} reporter
   * @return {Array.<ParseTree>}
   */
  transform(enclosingFinally, machineEndState, reporter) {
    var e = this.expression;
    if (e && !isUndefined(e) && !isVoidExpression(e)) {
      return [
        // 'this' refers to the '$G' object from
        // GeneratorTransformer.transformGeneratorBody
        //
        // this.$yieldReturn = expression;
        createAssignmentStatement(
            createMemberExpression(createThisExpression(), YIELD_RETURN),
            this.expression),
        ...State.generateJump(enclosingFinally, machineEndState)
      ];
    } else {
      return State.generateJump(enclosingFinally, machineEndState);
    }
  }
}

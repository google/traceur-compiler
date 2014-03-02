// Copyright 2014 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  BINARY_OPERATOR,
  YIELD_EXPRESSION
} from '../../syntax/trees/ParseTreeType';

/**
 * @param {ParseTree} tree Expression tree
 * @return {boolean}
 */
function isYieldAssign(tree) {
  return tree.type === BINARY_OPERATOR &&
      tree.operator.isAssignmentOperator() &&
      tree.right.type === YIELD_EXPRESSION &&
      tree.left.isLeftHandSideExpression();
}

export default isYieldAssign;

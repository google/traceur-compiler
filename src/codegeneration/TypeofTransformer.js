// Copyright 2013 Google Inc.
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

import {IDENTIFIER_EXPRESSION} from '../syntax/trees/ParseTreeType';
import {ParseTreeTransformer} from './ParseTreeTransformer';
import {TYPEOF} from '../syntax/TokenType';
import {parseExpression} from './PlaceholderParser';

export class TypeofTransformer extends ParseTreeTransformer {

  transformUnaryExpression(tree) {
    if (tree.operator.type !== TYPEOF)
      return super.transformUnaryExpression(tree);

    var operand = this.transformAny(tree.operand);

    var expression = parseExpression `$traceurRuntime.typeof(${operand})`;

    if (operand.type === IDENTIFIER_EXPRESSION) {
      // For ident we cannot just call the function since the ident might not
      // be bound to an identifier. This is important if the free variable
      // pass is not turned on.
      return parseExpression `(typeof ${operand} === 'undefined' ?
          'undefined' : ${expression})`;
    }

    return expression;
  }
}

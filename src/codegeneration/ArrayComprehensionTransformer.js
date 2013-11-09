// Copyright 2012 Traceur Authors.
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

import {ComprehensionTransformer} from './ComprehensionTransformer';
import {createIdentifierExpression} from './ParseTreeFactory';
import {parseStatement} from './PlaceholderParser';

/**
 * Array Comprehension Transformer:
 *
 * The desugaring is defined at
 * http://wiki.ecmascript.org/doku.php?id=harmony:array_comprehensions
 * as something like this:
 *
 * [ Expression0 for ( LHSExpression1 of Expression1 )
 *               ...
 *               for ( LHSExpressionn ) if ( Expression )opt ]
 *
 * =>
 *
 * (function () {
 *     var $result = [], $i = 0;
 *     for (let LHSExpression1 of Expression1 ) {
 *         ...
 *         for (let LHSExpressionn of Expressionn ) {
 *             if ( Expression )opt
 *                 $result[$i++] = Expression0;
 *             }
 *         }
 *     }
 *     return $result;
 * })()
 *
 * with alpha renaming of this and arguments of course.
 */
export class ArrayComprehensionTransformer extends ComprehensionTransformer {

  transformArrayComprehension(tree) {
    this.pushTempVarState();

    var expression = this.transformAny(tree.expression);

    var index = createIdentifierExpression(this.getTempIdentifier());
    var result = createIdentifierExpression(this.getTempIdentifier());

    var tempVarsStatatement = parseStatement `var ${index} = 0, ${result} = [];`;
    var statement = parseStatement `${result}[${index}++] = ${expression};`;
    var returnStatement = parseStatement `return ${result};`;
    var isGenerator = false;

    var result = this.transformComprehension(tree, statement, isGenerator,
                                             tempVarsStatatement,
                                             returnStatement);
    this.popTempVarState();
    return result;
  }
}

/**
 * @param {UniqueIdentifierGenerator} identifierGenerator
 * @param {ParseTree} tree
 * @return {ParseTree}
 */
ArrayComprehensionTransformer.transformTree =
    function(identifierGenerator, tree) {
  return new ArrayComprehensionTransformer(identifierGenerator).
      transformAny(tree);
};

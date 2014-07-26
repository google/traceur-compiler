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

import {FunctionExpression} from '../syntax/trees/ParseTrees';
import {TempVarTransformer} from './TempVarTransformer';
import {FUNCTION_BODY} from '../syntax/trees/ParseTreeType';
import alphaRenameThisAndArguments from './alphaRenameThisAndArguments';
import {
  createFunctionBody,
  createParenExpression,
  createReturnStatement
} from './ParseTreeFactory';

/**
 * Converts a concise body to a function body.
 * @param {ParseTree} tree
 * @return {FunctionBody}
 */
function convertConciseBody(tree) {
  if (tree.type !== FUNCTION_BODY)
    return createFunctionBody([createReturnStatement(tree)]);
  return tree;
}

/**
 * Desugars arrow function expressions
 *
 * @see <a href="http://wiki.ecmascript.org/doku.php?id=strawman:arrow_function_syntax">strawman:arrow_function_syntax</a>
 */
export class ArrowFunctionTransformer extends TempVarTransformer {

  /**
   * Transforms an arrow function expression into a function declaration.
   * The main things we need to deal with are the 'this' binding, and adding a
   * function body and return statement if needed.
   */
  transformArrowFunctionExpression(tree) {
    var alphaRenamed = alphaRenameThisAndArguments(this, tree);
    var parameterList = this.transformAny(alphaRenamed.parameterList);

    var body = this.transformAny(alphaRenamed.body);
    body = convertConciseBody(body);
    var functionExpression = new FunctionExpression(tree.location, null,
        tree.functionKind, parameterList, null, [], body);

    return createParenExpression(functionExpression);
  }

  /**
   * Shallowly transforms |tree| into a FunctionExpression and adds the needed
   * temp variables to the |tempVarTransformer|.
   * @param {TempVarTransformer} tempVarTransformer
   * @param {ArrowFunctionExpression} tree
   * @return {FunctionExpression}
   */
  static transform(tempVarTransformer, tree) {
    tree = alphaRenameThisAndArguments(tempVarTransformer, tree);
    var body = convertConciseBody(tree.body);
    return new FunctionExpression(tree.location, null, tree.functionKind,
        tree.parameterList, null, [], body);
  }
}

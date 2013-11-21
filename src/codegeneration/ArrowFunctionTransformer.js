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

import {
  FormalParameterList
} from '../syntax/trees/ParseTrees';
import {TempVarTransformer} from './TempVarTransformer';

import {
  FUNCTION_BODY,
  FUNCTION_EXPRESSION
} from '../syntax/trees/ParseTreeType';
import alphaRenameThisAndArguments from './alphaRenameThisAndArguments';
import {
  createFunctionBody,
  createFunctionExpression,
  createParenExpression,
  createReturnStatement
} from './ParseTreeFactory';


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
    var parameters;
    if (tree.formalParameters) {
      parameters = this.transformAny(tree.formalParameters).parameters;
    } else {
      parameters = [];
    }

    var functionBody = this.transformAny(tree.functionBody);
    if (functionBody.type != FUNCTION_BODY) {
      // { return expr; }
      functionBody = createFunctionBody([createReturnStatement(functionBody)]);
    }

    functionBody = alphaRenameThisAndArguments(this, functionBody);

    // function(params) { ... }
    return createParenExpression(
        createFunctionExpression(
            new FormalParameterList(null, parameters), functionBody));
  }

  static transformTree(identifierGenerator, tree) {
    return new ArrowFunctionTransformer(identifierGenerator).transformAny(tree);
  }
}

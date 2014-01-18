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

import assertType from './assertType';
import {
  ReturnStatement
} from '../syntax/trees/ParseTrees';
import {ParseTreeTransformer} from './ParseTreeTransformer';

/*
 * Traverses a single function body and adds {@code assert.type} calls
 * around return expressions.
 */
export class ReturnTypeAsserter extends ParseTreeTransformer {
  /**
   * @param {ParseTree} type
   */
  constructor(returnType) {
    super();
    this.returnType_ = returnType;
  }

  transformReturnStatement(tree) {
    var expression = assertType(tree.expression, this.returnType_);

    if (tree.expression !== expression)
      return new ReturnStatement(tree.location, expression);
    return tree;
  }

  transformFunctionDeclaration(tree) {
    // Don't recurse into functions, we're processing a single function body.
    return tree;
  }

  transformFunctionExpression(tree) {
    // Don't recurse into functions, we're processing a single function body.
    return tree;
  }

  /**
   * @param {ParseTree} body The function body to traverse for return statements
   * @param {ParseTree} typeAnnotation The return type of the enclosing function
   *    to use for the type assertion.
   * @return {ParseTree} A copy of {@code body} with type assertions wrapping
   *    the return expressions.
   */
  static assertTypes(body, typeAnnotation) {
    return new ReturnTypeAsserter(typeAnnotation).transformAny(body);
  }
}


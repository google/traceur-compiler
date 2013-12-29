// Copyright 2013 Traceur Authors.
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
 * Adds {@code assert.type} calls around variable expressions
 * and return values.  If the tree has formal parameters and a body then
 * then type asserts are prepended to the function for any parameter with
 * a type annotation.
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
    // do no recurse into functions
    return tree;
  }

  transformFunctionExpression(tree) {
    // do no recurse into functions
    return tree;
  }

  /**
   * @param {ParseTree} tree the tree to add type assertions in.
   * @param {ParseTree} returnType the return type
   * @return {ParseTree} a copy of {@code tree} with type assertions added.
   */
  static assertTypes(tree, returnType) {
    return new ReturnTypeAsserter(returnType).transformAny(tree);
  }
}


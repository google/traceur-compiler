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
  AnonBlock,
  FormalParameter,
  FunctionDeclaration,
  FunctionExpression,
  GetAccessor,
  PropertyMethodAssignment,
  VariableDeclaration
} from '../syntax/trees/ParseTrees.js';
import {ParseTreeTransformer} from './ParseTreeTransformer.js';

/**
 * Desugars type annotations.
 */
export class TypeTransformer extends ParseTreeTransformer {

  /**
   * @param {VariableDeclaration} tree
   * @return {ParseTree}
   */
  transformVariableDeclaration(tree) {
    if (tree.typeAnnotation) {
      tree = new VariableDeclaration(tree.location, tree.lvalue, null,
          tree.initializer);
    }
    return super.transformVariableDeclaration(tree);
  }

  /**
   * @param {FormalParameter} tree
   * @return {ParseTree}
   */
  transformFormalParameter(tree) {
    if (tree.typeAnnotation !== null)
      return new FormalParameter(tree.location, tree.parameter, null, []);
    return tree;
  }

  /**
   * @param {FunctionDeclaration} tree
   * @return {ParseTree}
   */
  transformFunctionDeclaration(tree) {
    if (tree.typeAnnotation) {
      tree = new FunctionDeclaration(tree.location, tree.name, tree.functionKind,
          tree.parameterList, null, tree.annotations, tree.body);
    }

    return super.transformFunctionDeclaration(tree);
  }

  /**
   * @param {FunctionExpression} tree
   * @return {ParseTree}
   */
  transformFunctionExpression(tree) {
    if (tree.typeAnnotation) {
      tree = new FunctionExpression(tree.location, tree.name, tree.functionKind,
          tree.parameterList, null, tree.annotations, tree.body);
    }

    return super.transformFunctionExpression(tree);
  }

  /**
   * @param {PropertyMethodAssignemnt} tree
   * @return {ParseTree}
   */
  transformPropertyMethodAssignment(tree) {
    if (tree.typeAnnotation) {
      tree = new PropertyMethodAssignment(tree.location, tree.isStatic,
          tree.functionKind, tree.name, tree.parameterList, null,
          tree.annotations, tree.body, tree.debugName);
    }

    return super.transformPropertyMethodAssignment(tree);
  }

  /**
   * @param {GetAccessor} tree
   * @return {ParseTree}
   */
  transformGetAccessor(tree) {
    if (tree.typeAnnotation) {
      tree = new GetAccessor(tree.location, tree.isStatic, tree.name, null,
          tree.annotations, tree.body);
    }

    return super.transformGetAccessor(tree);
  }

  transformInterfaceDeclaration(tree) {
    return new AnonBlock(null, []);
  }
}

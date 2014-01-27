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
  BINDING_ELEMENT,
  REST_PARAMETER
} from '../syntax/trees/ParseTreeType';
import {
  ImportDeclaration,
  ImportSpecifier,
  ImportSpecifierSet,
  Module,
  ModuleSpecifier,
  ReturnStatement,
  Script,
  VariableDeclaration
} from '../syntax/trees/ParseTrees';
import {
  createExpressionStatement,
  createIdentifierToken,
  createStringLiteralToken
} from './ParseTreeFactory';
import {
  parseExpression,
  parseStatement
} from './PlaceholderParser';
import {ParameterTransformer} from './ParameterTransformer';
import {options} from '../options';

/**
 * Inserts runtime type assertions for type annotations.
 *
 *   function test(a:Number):Number {
 *     return a * 10;
 *   }
 *
 *   =>
 *
 *   function test(a:Number):Number {
 *     assert.type(a, Number);
 *     return assert.type(a * 10, Number);
 *   }
 */
export class TypeAssertionTransformer extends ParameterTransformer {
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   */
  constructor(identifierGenerator) {
    super(identifierGenerator);
    this.returnTypeStack_ = [];
    this.assertionAdded_ = false;
  }

  /**
   * @param {Script} tree
   * @return {ParseTree}
   */
  transformScript(tree) {
    return this.prependAssertionImport_(super(tree), Script);
  }

  /**
   * @param {Module} tree
   * @return {ParseTree}
   */
  transformModule(tree) {
    return this.prependAssertionImport_(super(tree), Module);
  }

  /**
   * @param {VariableDeclaration} tree
   * @return {ParseTree}
   */
  transformVariableDeclaration(tree) {
    if (tree.typeAnnotation) {
      tree = new VariableDeclaration(tree.location, tree.lvalue,
          tree.typeAnnotation,
          this.assertType_(tree.initialiser, tree.typeAnnotation));
    }
    return super(tree);
  }

  /**
   * @param {FormalParameter} tree
   * @return {ParseTree}
   */
  transformFormalParameter(tree) {
    if (tree.typeAnnotation !== null) {
      switch (tree.parameter.type) {
        case BINDING_ELEMENT:
          this.transformBindingElementParameter_(tree.parameter,
                                                 tree.typeAnnotation);
          break;

        case REST_PARAMETER:
          // NYI
          break;
      }
    }
    return super(tree);
  }

  /**
   * @param {GetAccessor} tree
   * @return {ParseTree}
   */
  transformGetAccessor(tree) {
    this.pushReturnType_(tree.typeAnnotation);
    tree = super(tree);
    this.popReturnType_();
    return tree;
  }

  /**
   * @param {PropertyMethodAssignemnt} tree
   * @return {ParseTree}
   */
  transformPropertyMethodAssignment(tree) {
    this.pushReturnType_(tree.typeAnnotation);
    tree = super(tree);
    this.popReturnType_();
    return tree;
  }

  /**
   * @param {FunctionDeclaration} tree
   * @return {ParseTree}
   */
  transformFunctionDeclaration(tree) {
    this.pushReturnType_(tree.typeAnnotation);
    tree = super(tree);
    this.popReturnType_();
    return tree;
  }

  /**
   * @param {FunctionExpression} tree
   * @return {ParseTree}
   */
  transformFunctionExpression(tree) {
    this.pushReturnType_(tree.typeAnnotation);
    tree = super(tree);
    this.popReturnType_();
    return tree;
  }

  /**
   * @param {ReturnStatement} tree
   * @return {ParseTree}
   */
  transformReturnStatement(tree) {
    tree = super(tree);
    var expression = this.assertType_(tree.expression, this.returnType_);
    if (tree.expression !== expression)
      return new ReturnStatement(tree.location, expression);
    return tree;
  }

  transformBindingElementParameter_(tree, typeAnnotation) {
    if (!tree.binding.isPattern()) {
        this.pushParameterAssertion_(tree, typeAnnotation);
        return;
    }

    // NYI
  }

  pushParameterAssertion_(element, typeAnnotation) {
    this.parameterStatements.push(createExpressionStatement(
        this.assertType_(element.binding.identifierToken, typeAnnotation)));
  }

  pushReturnType_(typeAnnotation) {
    this.returnTypeStack_.push(typeAnnotation);
  }

  assertType_(expression, typeAnnotation) {
    if (expression === null || typeAnnotation === null)
      return expression;
    this.assertionAdded_ = true;
    return parseExpression `assert.type(${expression}, ${typeAnnotation.name})`;
  }

  prependAssertionImport_(tree, Ctor) {
    if (!this.assertionAdded_ || options.typeAssertionModule === null)
      return tree;

    var importStatement = new ImportDeclaration(null,
        new ImportSpecifierSet(null,
            [new ImportSpecifier(null, createIdentifierToken('assert'), null)]),
        new ModuleSpecifier(null,
            createStringLiteralToken(options.typeAssertionModule)));
    tree = new Ctor(tree.location,
                    [importStatement, ...tree.scriptItemList],
                    tree.moduleName);
    return tree;
  }

  popReturnType_() {
    return this.returnTypeStack_.pop();
  }

  get returnType_() {
    return this.returnTypeStack_.length > 0 ?
        this.returnTypeStack_[this.returnTypeStack_.length - 1] :
        null;
  }
}

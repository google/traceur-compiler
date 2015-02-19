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
} from '../syntax/trees/ParseTreeType.js';
import {
  ImportDeclaration,
  ImportSpecifier,
  ImportSpecifierSet,
  Module,
  ModuleSpecifier,
  Script,
  VariableDeclaration
} from '../syntax/trees/ParseTrees.js';
import {
  createArgumentList,
  createIdentifierExpression,
  createImportedBinding,
  createStringLiteralToken
} from './ParseTreeFactory.js';
import {
  parseExpression,
  parseStatement
} from './PlaceholderParser.js';
import {ParameterTransformer} from './ParameterTransformer.js';

/**
 * Inserts runtime type assertions for type annotations.
 *
 *   function test(a:number):number {
 *     var b:number = 10;
 *     return a * b;
 *   }
 *
 *   =>
 *
 *   function test(a) {
 *     assert.argumentTypes(a, $traceurRuntime.type.number);
 *     assert.type(b, $traceurRuntime.type.number);
 *     return assert.returnType((a * 10), $traceurRuntime.type.number);
 *   }
 */
export class TypeAssertionTransformer extends ParameterTransformer {
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   */
  constructor(identifierGenerator, reporter, options) {
    super(identifierGenerator);
    this.options_ = options;
    this.returnTypeStack_ = [];
    this.parametersStack_ = [];
    this.assertionAdded_ = false;
  }

  /**
   * @param {Script} tree
   * @return {ParseTree}
   */
  transformScript(tree) {
    return this.prependAssertionImport_(super.transformScript(tree), Script);
  }

  /**
   * @param {Module} tree
   * @return {ParseTree}
   */
  transformModule(tree) {
    return this.prependAssertionImport_(super.transformModule(tree), Module);
  }

  /**
   * @param {VariableDeclaration} tree
   * @return {ParseTree}
   */
  transformVariableDeclaration(tree) {
    if (tree.typeAnnotation && tree.initializer) {
      let assert = parseExpression `assert.type(${tree.initializer}, ${tree.typeAnnotation})`;
      tree = new VariableDeclaration(tree.location, tree.lvalue, tree.typeAnnotation, assert);

      this.assertionAdded_ = true;
    }
    return super.transformVariableDeclaration(tree);
  }

  transformFormalParameterList(tree) {

    // because param lists can be nested
    this.parametersStack_.push({
      atLeastOneParameterTyped: false,
      arguments: []
    });

    let transformed = super.transformFormalParameterList(tree);
    let params = this.parametersStack_.pop();

    if (params.atLeastOneParameterTyped) {
      let argumentList = createArgumentList(params.arguments);
      let assertStatement = parseStatement `assert.argumentTypes(${argumentList})`;

      this.parameterStatements.push(assertStatement);
      this.assertionAdded_ = true;
    }

    return transformed;
  }

  /**
   * @param {FormalParameter} tree
   * @return {ParseTree}
   */
  transformFormalParameter(tree) {
    let transformed = super.transformFormalParameter(tree);

    switch (transformed.parameter.type) {
      case BINDING_ELEMENT:
        this.transformBindingElementParameter_(transformed.parameter,
                                               transformed.typeAnnotation);
        break;

      case REST_PARAMETER:
        // NYI
        break;
    }

    return transformed;
  }

  /**
   * @param {GetAccessor} tree
   * @return {ParseTree}
   */
  transformGetAccessor(tree) {
    this.pushReturnType_(tree.typeAnnotation);
    tree = super.transformGetAccessor(tree);
    this.popReturnType_();
    return tree;
  }

  /**
   * @param {PropertyMethodAssignemnt} tree
   * @return {ParseTree}
   */
  transformPropertyMethodAssignment(tree) {
    this.pushReturnType_(tree.typeAnnotation);
    tree = super.transformPropertyMethodAssignment(tree);
    this.popReturnType_();
    return tree;
  }

  /**
   * @param {FunctionDeclaration} tree
   * @return {ParseTree}
   */
  transformFunctionDeclaration(tree) {
    this.pushReturnType_(tree.typeAnnotation);
    tree = super.transformFunctionDeclaration(tree);
    this.popReturnType_();
    return tree;
  }

  /**
   * @param {FunctionExpression} tree
   * @return {ParseTree}
   */
  transformFunctionExpression(tree) {
    this.pushReturnType_(tree.typeAnnotation);
    tree = super.transformFunctionExpression(tree);
    this.popReturnType_();
    return tree;
  }

  /**
   * @param {ArrowFunctionExpression} tree
   * @return {ArrowFunctionExpression}
   */
  transformArrowFunctionExpression(tree) {
    this.pushReturnType_(null);
    tree = super.transformArrowFunctionExpression(tree);
    this.popReturnType_();
    return tree;
  }

  /**
   * @param {ReturnStatement} tree
   * @return {ParseTree}
   */
  transformReturnStatement(tree) {
    tree = super.transformReturnStatement(tree);

    if (this.returnType_ && tree.expression) {
      this.assertionAdded_ = true;
      return parseStatement `return assert.returnType((${tree.expression}), ${this.returnType_})`;
    }

    return tree;
  }

  transformBindingElementParameter_(element, typeAnnotation) {
    if (!element.binding.isPattern()) {
      if (typeAnnotation) {
        this.paramTypes_.atLeastOneParameterTyped = true;
      } else {
        typeAnnotation = parseExpression `$traceurRuntime.type.any`;
      }

      this.paramTypes_.arguments.push(
        createIdentifierExpression(element.binding.identifierToken),
        typeAnnotation);
      return;
    }

    // NYI
  }

  pushReturnType_(typeAnnotation) {
    this.returnTypeStack_.push(this.transformAny(typeAnnotation));
  }

  prependAssertionImport_(tree, Ctor) {
    if (!this.assertionAdded_ || this.options_.typeAssertionModule === null)
      return tree;

    let binding = createImportedBinding('assert');
    let importStatement = new ImportDeclaration(null,
        new ImportSpecifierSet(null,
            [new ImportSpecifier(null, binding, null)]),
        new ModuleSpecifier(null,
            createStringLiteralToken(this.options_.typeAssertionModule)));
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

  get paramTypes_() {
    return this.parametersStack_[this.parametersStack_.length - 1];
  }
}

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
  ARRAY_LITERAL_EXPRESSION,
  ARRAY_PATTERN,
  BINDING_ELEMENT,
  BINDING_IDENTIFIER,
  BLOCK,
  CALL_EXPRESSION,
  COMPUTED_PROPERTY_NAME,
  IDENTIFIER_EXPRESSION,
  LITERAL_EXPRESSION,
  MEMBER_EXPRESSION,
  MEMBER_LOOKUP_EXPRESSION,
  OBJECT_LITERAL_EXPRESSION,
  OBJECT_PATTERN,
  OBJECT_PATTERN_FIELD,
  PAREN_EXPRESSION,
  REST_PARAMETER,
  VARIABLE_DECLARATION_LIST
} from '../syntax/trees/ParseTreeType';
import {
  FormalParameter,
  FunctionDeclaration,
  FunctionExpression,
  GetAccessor,
  PropertyMethodAssignment,
  ReturnStatement,
  VariableDeclaration
} from '../syntax/trees/ParseTrees';
import {createExpressionStatement} from './ParseTreeFactory';
import {ParameterTransformer} from './ParameterTransformer';
import assertType from './assertType';

/**
 *
 */
export class TypeAssertionTransformer extends ParameterTransformer {
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   */
  constructor(identifierGenerator) {
    super(identifierGenerator);
    this.returnTypeStack_ = [];
    this.currentType_ = null;
  }

  /**
   * @param {VariableDeclaration} tree
   * @return {ParseTree}
   */
  transformVariableDeclaration(tree) {
    if (tree.typeAnnotation) {
      tree = new VariableDeclaration(tree.location, tree.lvalue,
          tree.typeAnnotation,
          assertType(tree.initialiser, tree.typeAnnotation));
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
    var expression = assertType(tree.expression, this.returnType_);

    if (tree.expression !== expression)
      return new ReturnStatement(tree.location, expression);
    return tree;
  }

  transformBindingElementParameter_(tree, typeAnnotation) {
    if (!tree.binding.isPattern()) {
        this.pushParameterAssertion_(tree.binding.identifierToken,
                                     typeAnnotation);
        return;
    }

    switch (tree.binding.type) {
      case ARRAY_PATTERN: {
        var pattern = tree.binding;
        pattern.elements.forEach((element) => {
          this.pushParameterAssertion_(element.binding.identifierToken,
                                       typeAnnotation);
        });
        break;
      }

      case OBJECT_PATTERN: {
        var pattern = tree.binding;
        pattern.fields.forEach((field) => {
          switch (field.type) {
            case BINDING_ELEMENT:
              this.pushParameterAssertion_(field.binding.identifierToken,
                                           typeAnnotation);
              break;

            case OBJECT_PATTERN_FIELD:
              this.pushParameterAssertion_(field.element.binding.identifierToken,
                                           typeAnnotation);
              break;

            case IDENTIFIER_EXPRESSION:
              break;

            default:
              throw Error('unreachable');
          }
        });
        break;
      }
    }
  }

  pushParameterAssertion_(parameter, typeAnnotation) {
    this.parameterStatements.push(createExpressionStatement(
        assertType(parameter, typeAnnotation)));
  }

  pushReturnType_(typeAnnotation) {
    this.returnTypeStack_.push(typeAnnotation);
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

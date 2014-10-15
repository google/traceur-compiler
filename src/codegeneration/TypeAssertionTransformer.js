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

import {CONSTRUCTOR} from '../syntax/PredefinedName';
import {EQUAL} from '../syntax/TokenType';
import {
  BINDING_ELEMENT,
  IDENTIFIER_EXPRESSION,
  MEMBER_EXPRESSION,
  PROPERTY_VARIABLE_DECLARATION,
  REST_PARAMETER,
  THIS_EXPRESSION
} from '../syntax/trees/ParseTreeType';
import {
  BinaryExpression,
  ImportDeclaration,
  ImportSpecifier,
  ImportSpecifierSet,
  Module,
  ModuleSpecifier,
  Script,
  VariableDeclaration
} from '../syntax/trees/ParseTrees';
import {
  createArgumentList,
  createIdentifierExpression,
  createImportedBinding,
  createStringLiteralToken
} from './ParseTreeFactory';
import {
  parseExpression,
  parseStatement
} from './PlaceholderParser';
import {ParameterTransformer} from './ParameterTransformer';
import {options} from '../Options';

/**
 * Inserts runtime type assertions
 *
 * * for type annotations:
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
 *
 * * for class properties:
 *
 *   class Test {
 *     a:number;
 *     static b:string;
 *
 *     test() {
 *       this.a = 0;
 *       Test.b = 'string';
 *       var nested = function() {
 *         this.a = 'unknown context';
 *       }
 *     }
 *   }
 *
 *   =>
 *
 *   class Test {
 *     a:number;
 *     static b:string;
 *
 *     test() {
 *       this.a = assert.type(0, $traceurRuntime.type.number);
 *       Test.b = assert.type('string', $traceurRuntime.type.string);
 *       var nested = function() {
 *         this.a = 'unknown context';
 *       }
 *     }
 *   }
 */
export class TypeAssertionTransformer extends ParameterTransformer {
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   */
  constructor(identifierGenerator) {
    super(identifierGenerator);
    this.returnTypeStack_ = [];
    this.parametersStack_ = [];
    // Types of the member variables indexed by variable names
    this.memberVariableTypes_ = null;
    // Types of the static member variables indexed by variable names
    this.staticMemberVariableTypes_ = null;
    // null outside of class declarations
    this.functionNestingLevel_ = null;
    this.className_ = null;
    this.assertionAdded_ = false;
  }

  /**
   * @param {ClassDeclaration} tree
   * @return {ClassDeclaration}
   */
  transformClassDeclaration(tree) {
    this.functionNestingLevel_ = 0;
    this.className_ = tree.name;
    this.memberVariableTypes_ = Object.create(null);
    this.staticMemberVariableTypes_ = Object.create(null);
    for (var i = 0; i < tree.elements.length; i++) {
      var element = tree.elements[i];
      if (element.type === PROPERTY_VARIABLE_DECLARATION &&
          element.typeAnnotation !== null) {
        var name = element.name.literalToken.value;
        if (element.isStatic) {
          this.staticMemberVariableTypes_[name] = element.typeAnnotation;
        } else {
          this.memberVariableTypes_[name] = element.typeAnnotation;
        }
      }
    }
    tree = super.transformClassDeclaration(tree);
    this.functionNestingLevel_ = null;
    this.className_ = null;
    return tree;
  }

  transformBinaryExpression(tree) {
    tree = super.transformBinaryExpression(tree);
    if (this.functionNestingLevel_ !== 1 || tree.operator.type !== EQUAL) {
      // We only want to transform assignments located in any method but
      // not inside nested functions
      return tree;
    }

    var type = this.getMemberExpressionType_(tree.left);
    if (type === null) {
      return tree;
    }

    this.assertionAdded_ = true;
    var right = parseExpression `assert.type(${tree.right}, ${type})`;
    return new BinaryExpression(tree.location, tree.left, tree.operator, right);
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
      var assert = parseExpression `assert.type(${tree.initializer}, ${tree.typeAnnotation})`;
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

    var transformed = super.transformFormalParameterList(tree);
    var params = this.parametersStack_.pop();

    if (params.atLeastOneParameterTyped) {
      var argumentList = createArgumentList(params.arguments);
      var assertStatement = parseStatement `assert.argumentTypes(${argumentList})`;

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
    var transformed = super.transformFormalParameter(tree);

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
   * @param {FunctionBody} tree
   * @returns {FunctionBody}
   */
  transformFunctionBody(tree) {
    if (this.functionNestingLevel_ !== null) {
      this.functionNestingLevel_++;
    }
    tree = super.transformFunctionBody(tree);
    if (this.functionNestingLevel_ !== null) {
      this.functionNestingLevel_--;
    }
    return tree;
  };

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

      this.paramTypes_.arguments.push(createIdentifierExpression(element.binding.identifierToken), typeAnnotation);
      return;
    }

    // NYI
  }

  pushReturnType_(typeAnnotation) {
    this.returnTypeStack_.push(this.transformAny(typeAnnotation));
  }

  prependAssertionImport_(tree, Ctor) {
    if (!this.assertionAdded_ || options.typeAssertionModule === null)
      return tree;

    var binding = createImportedBinding('assert');
    var importStatement = new ImportDeclaration(null,
        new ImportSpecifierSet(null,
            [new ImportSpecifier(null, binding, null)]),
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

  get paramTypes_() {
    return this.parametersStack_[this.parametersStack_.length - 1];
  }

  /**
   * Returns the type of the expression when it is known, null otherwise.
   *
   * A type is returned when the expression is either of the form this.prop
   * or ClassName.prop (static properties) and a typed variable declaration for
   * prop exists in the current class.
   */
  getMemberExpressionType_(tree) {
    if (tree.type !== MEMBER_EXPRESSION) {
      return null;
    }

    if (tree.operand.type === THIS_EXPRESSION) {
      var name = tree.memberName.toString();
      var type = this.memberVariableTypes_[name];
      return type ? type : null;
    }

    if (tree.operand.type === IDENTIFIER_EXPRESSION &&
        tree.operand.identifierToken.value === this.className_.identifierToken.value) {
      var name = tree.memberName.toString();
      var type = this.staticMemberVariableTypes_[name];
      return type ? type : null;
    }

    return null;
  }
}

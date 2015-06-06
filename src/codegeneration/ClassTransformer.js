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
  CONSTRUCTOR
} from '../syntax/PredefinedName.js';
import {
  AnonBlock,
  ClassExpression,
  ExportDeclaration,
  FunctionDeclaration,
  FunctionExpression,
  GetAccessor,
  PropertyMethodAssignment,
  SetAccessor
} from '../syntax/trees/ParseTrees.js';
import {
  createBindingIdentifier,
  createIdentifierToken
} from '../codegeneration/ParseTreeFactory.js';
import {
  COMPUTED_PROPERTY_NAME,
  GET_ACCESSOR,
  PROPERTY_METHOD_ASSIGNMENT,
  SET_ACCESSOR,
} from '../syntax/trees/ParseTreeType.js';
import {SuperTransformer} from './SuperTransformer.js';
import {TempVarTransformer} from './TempVarTransformer.js';
import {
  CONST,
  LET,
  VAR,
  STRING
} from '../syntax/TokenType.js';
import {MakeStrictTransformer} from './MakeStrictTransformer.js';
import {ParenTrait} from './ParenTrait.js';
import {
  createEmptyParameterList,
  createFunctionBody,
  createIdentifierExpression as id,
  createMemberExpression,
  createObjectLiteralExpression,
  createThisExpression,
  createVariableStatement
} from './ParseTreeFactory.js';
import {hasUseStrict} from '../semantics/util.js';
import {
  parseExpression,
  parseStatements
} from './PlaceholderParser.js';
import {propName} from '../staticsemantics/PropName.js';


// Interaction between ClassTransformer and SuperTransformer:
// - The initial call to SuperTransformer will always be a transformBlock on
//   the body of a function -- method, getter, setter, or constructor.
// - SuperTransformer will never see anything that has not been touched first
//   by ClassTransformer and (if applicable) a previous invocation of
//   SuperTransformer on the functions of any inner classes. [see ref_1]
// - This means that SuperTransformer should only ever see desugared class
//   declarations, and should never see any super expressions that refer to
//   any inner (or outer) classes.


// Maximally minimal classes
//
//   http://wiki.ecmascript.org/doku.php?id=strawman:maximally_minimal_classes
//
// This transforms class declarations and class expressions.
//
//   class C extends B {
//     constructor(x) {
//       super();
//     }
//     method() {
//       super.m();
//     }
//   }
//
//   =>
//
//   var C = function(x) {
//     $traceurRuntime.superConstructor($C).call(this));
//   };
//   var $C = $traceurRuntime.createClass(C, {
//     method: function() {
//       $traceurRuntime.superGet(this, $C.prototype, 'm').call(this);
//     }
//   }, {}, B);
//

function classCall(func, object, staticObject, superClass) {
  if (superClass) {
    return parseExpression
        `($traceurRuntime.createClass)(${func}, ${object}, ${staticObject},
                                       ${superClass})`;
  }
  return parseExpression
      `($traceurRuntime.createClass)(${func}, ${object}, ${staticObject})`;
}

function methodNameFromTree(tree) {
  // COMPUTED_PROPERTY_NAME such as [Symbol.iterator]
  if (tree.type === COMPUTED_PROPERTY_NAME) {
    return '';
  }

  if (tree.literalToken && tree.literalToken.type === STRING) {
    return tree.getStringValue().substr(1, -1);
  }

  // identifier, delete, import, catch, etc.
  return tree.getStringValue();
}

function classMethodDebugName(className, methodName, isStatic) {
  if (isStatic) {
    return createBindingIdentifier('$__' + className + '_' + methodName);
  }

  return createBindingIdentifier('$__' + className + '_prototype_' + methodName);
}

function functionExpressionToDeclaration(tree, name) {
  if (tree.name === null) {
    name = createBindingIdentifier(name);
  } else {
    name = tree.name;
  }
  return new FunctionDeclaration(tree.location, name, tree.functionKind,
      tree.parameterList, tree.typeAnnotation, tree.annotations, tree.body);
}

export class ClassTransformer extends ParenTrait(TempVarTransformer) {
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ErrorReporter} reporter
   * @param {Options} options
   */
  constructor(identifierGenerator, reporter, options) {
    super(identifierGenerator, reporter, options);
    this.strictCount_ = 0;
    this.state_ = null;
  }

  // Override to handle AnonBlock
  transformExportDeclaration(tree) {
    let transformed = super.transformExportDeclaration(tree);
    if (transformed === tree)
      return tree;

    let declaration = transformed.declaration;
    if (declaration instanceof AnonBlock) {
      let statements = [
        new ExportDeclaration(null, declaration.statements[0], []),
        ...declaration.statements.slice(1)
      ];
      return new AnonBlock(null, statements);
    }
    return transformed;
  }

  transformModule(tree) {
    this.strictCount_ = 1;
    return super.transformModule(tree);
  }

  transformScript(tree) {
    this.strictCount_ = hasUseStrict(tree.scriptItemList) ? 1 : 0;
    return super.transformScript(tree);
  }

  transformFunctionBody(tree) {
    let useStrict = hasUseStrict(tree.statements) ? 1 : 0;
    this.strictCount_ += useStrict;
    let result = super.transformFunctionBody(tree);
    this.strictCount_ -= useStrict;
    return result;
  }

  makeStrict_(tree) {
    if (this.strictCount_)
      return tree;

    return MakeStrictTransformer.transformTree(tree);
  }

  /**
   * Transforms a single class declaration
   *
   * @param {ClassDeclaration} tree
   * @return {ParseTree}
   */
  transformClassDeclaration(tree) {
    // `class C {}` is equivalent to `let C = class C {};`
    // Convert to class expression and transform that instead.
    let classExpression = new ClassExpression(tree.location, tree.name,
        tree.superClass, tree.elements, tree.annotations, tree.typeParameters);
    let transformed = this.transformClassExpression(classExpression);
    let useLet = !this.options.transformOptions.blockBinding &&
                 this.options.parseOptions.blockBinding;
    return createVariableStatement(useLet ? LET : VAR, tree.name, transformed);
  }

  transformClassExpression(tree) {
    this.pushTempScope();

    let name;
    if (tree.name)
      name = tree.name.identifierToken;
    else
      name = createIdentifierToken(this.getTempIdentifier());

    let internalName = id(`${name}`);

    let oldState = this.state_;
    this.state_ = {hasSuper: false};
    let superClass = this.transformAny(tree.superClass);

    let protoElements = [], staticElements = [];
    let constructor;

    tree.elements.forEach((tree) => {
      let elements, homeObject, initVars;
      if (tree.isStatic) {
        elements = staticElements;
        homeObject = internalName;
      } else {
        elements = protoElements;
        homeObject = createMemberExpression(internalName, 'prototype');
      }

      switch (tree.type) {
        case GET_ACCESSOR:
          elements.push(
              this.transformGetAccessor_(tree, homeObject, internalName));
          break;

        case SET_ACCESSOR:
          elements.push(
              this.transformSetAccessor_(tree, homeObject, internalName));
          break;

        case PROPERTY_METHOD_ASSIGNMENT:
          if (!tree.isStatic && propName(tree) === CONSTRUCTOR) {
            constructor = tree;
          } else {
            let transformed = this.transformPropertyMethodAssignment_(
                tree, homeObject, internalName, name);
            elements.push(transformed);
          }
          break;

        default:
          throw new Error(`Unexpected class element: ${tree.type}`);
      }
    });

    let object = createObjectLiteralExpression(protoElements);
    let staticObject = createObjectLiteralExpression(staticElements);
    let func;

    if (!constructor) {
      func = this.getDefaultConstructor_(tree, internalName);
    } else {
      let homeObject = createMemberExpression(internalName, 'prototype');
      let transformedCtor = this.transformPropertyMethodAssignment_(
          constructor, homeObject, internalName, CONSTRUCTOR);
      func = new FunctionExpression(tree.location, tree.name, false,
          transformedCtor.parameterList, null, [], transformedCtor.body);
    }

    let state = this.state_;
    this.state_ = oldState;

    let hasSuper = state.hasSuper;
    let expression;

    if (hasSuper || tree.name) {
      // We need a binding name that can be referenced in the super calls and
      // we hide this name in an IIFE.

      let functionStatement;
      if (tree.name &&
          !this.options.transformOptions.blockBinding &&
          this.options.parseOptions.blockBinding) {
        functionStatement = createVariableStatement(CONST, tree.name, func);
      } else {
        functionStatement = functionExpressionToDeclaration(func, name);
      }

      if (superClass) {
        expression = parseExpression `function($__super) {
          ${functionStatement};
          return ($traceurRuntime.createClass)(${internalName}, ${object},
                                               ${staticObject}, $__super);
        }(${superClass})`;
      } else {
        expression = parseExpression `function() {
          ${functionStatement};
          return ($traceurRuntime.createClass)(${internalName}, ${object},
                                               ${staticObject});
        }()`;
      }
    } else {
      expression = classCall(func, object, staticObject, superClass);
    }

    this.popTempScope();

    return this.makeStrict_(expression);
  }

  transformPropertyMethodAssignment_(tree, homeObject, internalName,
                                     originalName) {
    let parameterList = this.transformAny(tree.parameterList);
    let body = this.transformSuperInFunctionBody_(
        tree.body, homeObject, internalName);

    if (!tree.isStatic &&
        parameterList === tree.parameterList &&
        body === tree.body) {
      return tree;
    }

    let debugName = tree.debugName;
    if (this.options.showDebugNames_) {
      debugName = classMethodDebugName(originalName,
                                       methodNameFromTree(tree.name), isStatic);
    }

    let isStatic = false;
    return new PropertyMethodAssignment(tree.location, isStatic,
        tree.functionKind, tree.name, parameterList, tree.typeAnnotation,
        tree.annotations, body, debugName);
  }

  transformGetAccessor_(tree, homeObject, internalName) {
    let body =
        this.transformSuperInFunctionBody_(tree.body, homeObject, internalName);
    if (!tree.isStatic && body === tree.body)
      return tree;
    // not static
    return new GetAccessor(tree.location, false, tree.name, tree.typeAnnotation,
                           tree.annotations, body);
  }

  transformSetAccessor_(tree, homeObject, internalName) {
    let parameterList = this.transformAny(tree.parameterList);
    let body =
        this.transformSuperInFunctionBody_(tree.body, homeObject, internalName);
    if (!tree.isStatic && body === tree.body)
      return tree;
    return new SetAccessor(tree.location, false, tree.name, parameterList,
                           tree.annotations, body);
  }

  transformSuperInFunctionBody_(tree, homeObject, internalName) {
    this.pushTempScope();
    let thisName = this.getTempIdentifier();
    let thisDecl = createVariableStatement(VAR, thisName,
                                           createThisExpression());
    let superTransformer = new SuperTransformer(this, homeObject,
                                                thisName, internalName);
    // ref_1: the inner transformFunctionBody call is key to proper super nesting.
    let transformedTree =
        superTransformer.transformFunctionBody(this.transformFunctionBody(tree));

    if (superTransformer.hasSuper)
      this.state_.hasSuper = true;

    this.popTempScope();

    if (superTransformer.nestedSuper)
      return createFunctionBody([thisDecl].concat(transformedTree.statements));
    return transformedTree;
  }

  getDefaultConstructor_(tree, internalName) {
    let constructorParams = createEmptyParameterList();
    let statements;
    if (tree.superClass) {
      statements = parseStatements `$traceurRuntime.superConstructor(
          ${internalName}).apply(this, arguments)`;
      constructorBody = createFunctionBody(statements);
      this.state_.hasSuper = true;
    } else {
      statements = [];
    }
    let constructorBody = createFunctionBody(statements);

    return new FunctionExpression(tree.location, tree.name, false,
                                  constructorParams, null, [], constructorBody);
  }
}

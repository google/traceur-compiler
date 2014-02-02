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

import {AlphaRenamer} from './AlphaRenamer';
import {
  CONSTRUCTOR
} from '../syntax/PredefinedName';
import {
  AnonBlock,
  ExportDeclaration,
  FunctionExpression,
  GetAccessor,
  PropertyMethodAssignment,
  SetAccessor
} from '../syntax/trees/ParseTrees';
import {
  GET_ACCESSOR,
  PROPERTY_METHOD_ASSIGNMENT,
  SET_ACCESSOR
} from '../syntax/trees/ParseTreeType';
import {SuperTransformer} from './SuperTransformer';
import {TempVarTransformer} from './TempVarTransformer';
import {VAR} from '../syntax/TokenType';
import {MakeStrictTransformer} from './MakeStrictTransformer';
import {
  createEmptyParameterList,
  createExpressionStatement,
  createFunctionBody,
  createIdentifierExpression as id,
  createMemberExpression,
  createObjectLiteralExpression,
  createParenExpression,
  createThisExpression,
  createVariableStatement
} from './ParseTreeFactory';
import {hasUseStrict} from '../semantics/util';
import {parseOptions} from '../options';
import {
  parseExpression,
  parseStatement,
  parseStatements
} from './PlaceholderParser';
import {propName} from '../staticsemantics/PropName';

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
//     $__superCall(this, $C.prototype, 'constructor', []);
//   };
//   var $C = $traceurRuntime.createClass(C, {
//     method: function() {
//       $traceurRuntime.superCall(this, $C.prototype, 'm', []);
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

export class ClassTransformer extends TempVarTransformer{
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ErrorReporter} reporter
   */
  constructor(identifierGenerator, reporter) {
    super(identifierGenerator);
    this.reporter_ = reporter;
    this.strictCount_ = 0;
    this.state_ = null;
  }

  // Override to handle AnonBlock
  transformExportDeclaration(tree) {
    var transformed = super(tree);
    if (transformed === tree)
      return tree;

    var declaration = transformed.declaration;
    if (declaration instanceof AnonBlock) {
      var statements = [
        new ExportDeclaration(null, declaration.statements[0], []),
        ...declaration.statements.slice(1)
      ];
      return new AnonBlock(null, statements);
    }
    return transformed;
  }

  transformModule(tree) {
    this.strictCount_ = 1;
    return super(tree);
  }

  transformScript(tree) {
    this.strictCount_ = +hasUseStrict(tree.scriptItemList);
    return super(tree);
  }

  transformFunctionBody(tree) {
    var useStrict = +hasUseStrict(tree.statements);
    this.strictCount_ += useStrict;
    var result = super(tree);
    this.strictCount_ -= useStrict;
    return result;
  }

  makeStrict_(tree) {
    if (this.strictCount_)
      return tree;

    return MakeStrictTransformer.transformTree(tree);
  }

  transformClassElements_(tree, internalName) {
    var oldState = this.state_;
    this.state_ = {hasSuper: false};
    var superClass = this.transformAny(tree.superClass);

    var hasConstructor = false;
    var protoElements = [], staticElements = [];
    var constructorBody, constructorParams;

    tree.elements.forEach((tree) => {
      var elements, homeObject;
      if (tree.isStatic) {
        elements = staticElements;
        homeObject = internalName;
      } else {
        elements = protoElements;
        homeObject = createMemberExpression(internalName, 'prototype');
      }

      switch (tree.type) {
        case GET_ACCESSOR:
          elements.push(this.transformGetAccessor_(tree, homeObject));
          break;

        case SET_ACCESSOR:
          elements.push(this.transformSetAccessor_(tree, homeObject));
          break;

        case PROPERTY_METHOD_ASSIGNMENT:
          var transformed =
              this.transformPropertyMethodAssignment_(tree, homeObject);
          if (!tree.isStatic && propName(tree) === CONSTRUCTOR) {
            hasConstructor = true;
            constructorParams = transformed.formalParameterList;
            constructorBody = transformed.functionBody;
          } else {
            elements.push(transformed);
          }
          break;

        default:
          throw new Error(`Unexpected class element: ${tree.type}`);
      }
    });

    var object = createObjectLiteralExpression(protoElements);
    var staticObject = createObjectLiteralExpression(staticElements);

    var func;
    if (!hasConstructor) {
      func = this.getDefaultConstructor_(tree, internalName);
    } else {
      func = new FunctionExpression(tree.location, tree.name, false,
                                    constructorParams, null, [],
                                    constructorBody);
    }

    var state = this.state_;
    this.state_ = oldState;

    return {
      func,
      superClass,
      object,
      staticObject,
      hasSuper: state.hasSuper,
    };
  }

  /**
   * Transforms a single class declaration
   *
   * @param {ClassDeclaration} tree
   * @return {ParseTree}
   */
  transformClassDeclaration(tree) {
    var name = tree.name.identifierToken;
    var internalName = id(`$${name}`);

    var renamed = AlphaRenamer.rename(tree, name.value, internalName.identifierToken.value);
    var referencesClassName = renamed !== tree
    var tree = renamed;

    var {
      func,
      hasSuper,
      object,
      staticObject,
      superClass
    } = this.transformClassElements_(tree, internalName);

    // TODO(arv): Use let.
    var statements = parseStatements `var ${name} = ${func}`;
    var expr = classCall(name, object, staticObject, superClass);

    if (hasSuper || referencesClassName) {
      // The internal name is so that super lookups continue to work even in
      // case someone overrides the class binding name.
      // Also, ClassExpression binds the class name in the class body.
      // TODO(arv): Use const for the internal name.
      statements.push(parseStatement `var ${internalName} = ${name}`);
    }
    statements.push(createExpressionStatement(expr));

    var anonBlock = new AnonBlock(null, statements);
    return this.makeStrict_(anonBlock);
  }

  transformClassExpression(tree) {
    this.pushTempVarState();

    var name;
    if (tree.name)
      name = tree.name.identifierToken;
    else
      name = id(this.getTempIdentifier());

    var {
      func,
      hasSuper,
      object,
      staticObject,
      superClass
    } = this.transformClassElements_(tree, name);

    var expression;

    if (hasSuper) {
      // We need a binding name that can be referenced in the super calls and
      // we hide this name in an IIFE.
      // TODO(arv): Use const.
      expression = parseExpression `function($__super) {
        var ${name} = ${func};
        return ($traceurRuntime.createClass)(${name}, ${object},
                                             ${staticObject}, $__super);
      }(${superClass})`;
    } else if (tree.name) {
      // The name should be locally bound in the class body.
      // TODO(arv): Use const.
      expression = parseExpression `function() {
        var ${name} = ${func};
        return ($traceurRuntime.createClass)(${name}, ${object},
                                             ${staticObject});
      }()`;
    } else {
      expression = classCall(func, object, staticObject, superClass);
    }

    this.popTempVarState();

    return createParenExpression(this.makeStrict_(expression));
  }

  transformPropertyMethodAssignment_(tree, internalName) {
    var formalParameterList = this.transformAny(tree.formalParameterList);
    var functionBody = this.transformSuperInFunctionBody_(tree,
        tree.functionBody, internalName);
    if (!tree.isStatic &&
        formalParameterList === tree.formalParameterList &&
        functionBody === tree.functionBody) {
      return tree;
    }

    var isStatic = false;
    return new PropertyMethodAssignment(tree.location, isStatic,
        tree.isGenerator, tree.name, formalParameterList, tree.typeAnnotation,
        tree.annotations, functionBody);
  }

  transformGetAccessor_(tree, internalName) {
    var body = this.transformSuperInFunctionBody_(tree, tree.body, internalName);
    if (!tree.isStatic && body === tree.body)
      return tree;
    // not static
    return new GetAccessor(tree.location, false, tree.name, tree.typeAnnotation,
                           tree.annotations, body);
  }

  transformSetAccessor_(tree, internalName) {
    var parameter = this.transformAny(tree.parameter);
    var body = this.transformSuperInFunctionBody_(tree, tree.body, internalName);
    if (!tree.isStatic && body === tree.body)
      return tree;
    return new SetAccessor(tree.location, false, tree.name, parameter,
                           tree.annotations, body);
  }

  transformSuperInFunctionBody_(methodTree, tree, internalName) {
    this.pushTempVarState();
    var thisName = this.getTempIdentifier();
    var thisDecl = createVariableStatement(VAR, thisName,
                                           createThisExpression());
    var superTransformer = new SuperTransformer(this, this.reporter_,
                                                internalName, methodTree,
                                                thisName);
    // ref_1: the inner transformFunctionBody call is key to proper super nesting.
    var transformedTree =
        superTransformer.transformFunctionBody(this.transformFunctionBody(tree));

    if (superTransformer.hasSuper)
      this.state_.hasSuper = true;

    this.popTempVarState();

    if (superTransformer.nestedSuper)
      return createFunctionBody([thisDecl].concat(transformedTree.statements));
    return transformedTree;
  }

  getDefaultConstructor_(tree, internalName) {
    var constructorParams = createEmptyParameterList();
    var constructorBody;
    if (tree.superClass) {
      var statement = parseStatement `$traceurRuntime.defaultSuperCall(this,
                ${internalName}.prototype, arguments)`;
      constructorBody = createFunctionBody([statement]);
      this.state_.hasSuper = true;
    } else {
      constructorBody = createFunctionBody([]);
    }

    return new FunctionExpression(tree.location, tree.name, false,
                                  constructorParams, null, [], constructorBody);
  }
}

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
} from '../syntax/PredefinedName';
import {
  AnonBlock,
  BindingIdentifier,
  Block,
  ClassExpression,
  ExportDeclaration,
  FunctionDeclaration,
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
  createBlock,
  createEmptyParameterList,
  createExpressionStatement,
  createFunctionBody,
  createIdentifierExpression as id,
  createMemberExpression,
  createObjectLiteralExpression,
  createParenExpression,
  createScopedExpression,
  createThisExpression,
  createUseStrictDirective,
  createVariableStatement
} from './ParseTreeFactory';
import {hasUseStrict} from '../semantics/util.js';
import {parseOptions} from '../options';
import {
  parseExpression,
  parsePropertyDefinition,
  parseStatement
} from './PlaceholderParser';
import {propName} from '../staticsemantics/PropName';

// This code is more or less identical to ClassDefinitionEvaluation in the ES6
// draft.
var GET_PROTO_PARENT_CODE =
    `function(superClass) {
      if (typeof superClass === 'function') {
        var prototype = superClass.prototype;
        if (Object(prototype) === prototype || prototype === null)
          return prototype;
      }
      if (superClass === null)
        return null;
      throw new %TypeError();
    }`;

var CLASS_CODE =
    `function(ctor, object, staticObject, superClass, protoParent) {
      %defineProperty(object, 'constructor', {value: ctor, configurable: true, writable: true, enumerable: false});
      if (arguments.length > 3) {
        if (typeof superClass === 'function')
          ctor.__proto__ = superClass;
        ctor.prototype = Object.create(protoParent || %getProtoParent(superClass), %getDescriptors(object));
      } else {
        ctor.prototype = object;
      }
      return %defineProperties(ctor, %getDescriptors(staticObject));
    }`;

// Interaction between ClassTransformer and SuperTransformer:
// - The initial call to SuperTransformer will always be a transformBlock on
//   the body of a function -- method, getter, setter, or constructor.
// - SuperTransformer will never see anything that has not been touched first
//   by ClassTransformer and (if applicable) a previous invocation of
//   SuperTransformer on the functions of any inner classes. [see ref_1]
// - This means that SuperTransformer should only ever see desugared class
//   declarations, and should never see any super expressions that refer to
//   any inner (or outer) classes.

/**
 * Maximally minimal classes
 *
 *   http://wiki.ecmascript.org/doku.php?id=strawman:maximally_minimal_classes
 *
 * This transforms class declarations and class expressions.
 *
 *   class C extends B {
 *     constructor(x) {
 *       super();
 *     }
 *     method() {
 *       super.m();
 *     }
 *   }
 *
 *   =>
 *
 *   function C(x) {
 *     $__superCall(this, $__C__proto, "constructor", []);
 *   }
 *   var $__C__proto = $__class(C, {
 *     method: function() {
 *       $__superCall(this, $__C__proto, "m", []);
 *     }
 *   }, {}, B);
 */
export class ClassTransformer extends TempVarTransformer{
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {RuntimeInliner} runtimeInliner
   * @param {ErrorReporter} reporter
   */
  constructor(identifierGenerator, runtimeInliner, reporter) {
    super(identifierGenerator);
    this.runtimeInliner_ = runtimeInliner;
    this.reporter_ = reporter;
    this.strictCount_ = 0;
    this.state_ = null;
  }

  transformExportDeclaration(tree) {
    var transformed = super(tree);
    if (transformed === tree)
      return tree;

    var declaration = transformed.declaration;
    if (declaration instanceof AnonBlock) {
      var statements = [
        new ExportDeclaration(null, declaration.statements[0]),
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

  transformClassElements_(tree, protoName, superName) {
    var oldState = this.state_;
    this.state_ = {hasStaticSuper: false, hasSuper: false};
    var superClass = this.transformAny(tree.superClass);

    var hasConstructor = false;
    var protoElements = [], staticElements = [];
    var constructorBody, constructorParams;

    if (!superClass) {
      protoName = this.runtimeInliner_.get('ObjectPrototype');
      superName = this.runtimeInliner_.get('FunctionPrototype');
    }

    tree.elements.forEach((tree) => {
      var elements, proto;
      if (tree.isStatic) {
        elements = staticElements;
        proto = superName;
      } else {
        elements = protoElements;
        proto = protoName;
      }

      switch (tree.type) {
        case GET_ACCESSOR:
          elements.push(this.transformGetAccessor_(tree, proto));
          break;

        case SET_ACCESSOR:
          elements.push(this.transformSetAccessor_(tree, proto));
          break;

        case PROPERTY_METHOD_ASSIGNMENT:
          var transformed =
              this.transformPropertyMethodAssignment_(tree, proto);
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

    var state = this.state_;
    this.state_ = oldState;

    if (!hasConstructor) {
      constructorParams = createEmptyParameterList();
      if (superClass) {
        constructorBody = createFunctionBody(
            [this.getDefaultConstructorBody_(tree, protoName)]);
        state.hasSuper = true;
      } else {
        constructorBody = createFunctionBody([]);
      }
    }

    return {
      hasConstructor,
      constructorParams,
      constructorBody,
      superClass,
      object,
      staticObject,
      hasSuper: state.hasSuper,
      hasStaticSuper: state.hasStaticSuper
    };
  }

  get class_() {
    this.runtimeInliner_.register('getProtoParent', GET_PROTO_PARENT_CODE);
    return this.runtimeInliner_.get('class', CLASS_CODE);
  }

  get getProtoParent_() {
    return this.runtimeInliner_.get('getProtoParent', GET_PROTO_PARENT_CODE);
  }

  /**
   * Transforms a single class declaration
   *
   * @param {ClassDeclaration} tree
   * @return {ParseTree}
   */
  transformClassDeclaration(tree) {
    // let <className> = ...
    // The name needs to be different from the class name but similar enough
    // that we can make sense out of our stack traces.
    var name = tree.name.identifierToken.value;

    var protoName = id(`$__${name}__proto`);
    var superName = id(`$__${name}__super`);

    var options =
        this.transformClassElements_(tree, protoName, superName);

    var anonBlock =
        this.transformClassShared_(tree, options, id(name), protoName, superName);
    return this.makeStrict_(anonBlock);
  }

  transformClassShared_(tree, options, name, protoName, superName) {
    var {
      constructorBody,
      constructorParams,
      hasConstructor,
      hasStaticSuper,
      hasSuper,
      object,
      staticObject,
      superClass
    } = options;

    var nameAsBinding = new BindingIdentifier(name.location,
                                              name.identifierToken);
    var func = new FunctionDeclaration(tree.location, nameAsBinding, false,
                                       constructorParams, constructorBody);
    var statements = [func];

    if (!superClass) {
      statements.push(parseStatement `(${this.class_})(${name}, ${object},
                                                       ${staticObject})`);
      return new AnonBlock(null, statements);
    }

    // If ClassExpression the superClass is a param to the IIFE.
    if (tree instanceof ClassExpression) {
      superClass = superName;
    } else if (hasStaticSuper || hasSuper) {
      statements.push(parseStatement `var ${superName} = ${superClass}`);
      // In the rest of the code gen just use the id instead.
      superClass = superName;
    }

    if (hasSuper) {
      statements.push(
          parseStatement `var ${protoName} = ${this.getProtoParent_}(${superClass})`);
      // We only need a binding to the proto parent if super occurs in the code.
      statements.push(parseStatement
          `(${this.class_})(${name}, ${object}, ${staticObject},
                            ${superClass}, ${protoName})`);
    } else {
       statements.push(parseStatement
          `(${this.class_})(${name}, ${object}, ${staticObject},
                            ${superClass})`);
    }

    return new AnonBlock(null, statements);
  }

  transformClassExpression(tree) {
    this.pushTempVarState();
    var name, protoName, superName;
    if (tree.name) {
      name = tree.name.identifierToken.value;
      protoName = `$__${name}__proto`;
      superName = `$__${name}__super`;
    } else {
      name = this.getTempIdentifier();
      protoName = `${name}__proto`;
      superName = `${name}__super`;
    }

    var expression = this.transformClassExpression_(tree, id(name),
                                                    id(protoName),
                                                    id(superName));

    this.popTempVarState();

    return createParenExpression(this.makeStrict_(expression));
  }

  transformClassExpression_(tree, name, protoName, superName) {
    var options = this.transformClassElements_(tree, protoName, superName);
    var {
      constructorBody,
      constructorParams,
      hasConstructor,
      hasStaticSuper,
      hasSuper,
      object,
      staticObject,
      superClass
    } = options;

    // If we have a non named ClassExpression without any super we can do a
    // simple expression. Otherwise we need to use an IIFE.
    if (!tree.name && !superClass && !hasSuper && !hasStaticSuper) {
      var func = new FunctionExpression(tree.location, tree.name, false,
                                        constructorParams, constructorBody);
      return parseExpression `(${this.class_})(${func}, ${object},
                                               ${staticObject})`;
    }

    // Otherwise we need an IIFE and we use the same transformation as for
    // ClassDeclaration.
    var anonBlock =
        this.transformClassShared_(tree, options, name, protoName, superName);

    var block = createBlock([
      ...anonBlock.statements,
      parseStatement `return ${name}`
    ]);

    if (superClass) {
      // The place holder parser has some extra handling to allow blocks as
      // only child of a FunctionBody.
      return parseExpression `(function(${superName}) {
        ${block}
      })(${superClass})`;
    }

    return parseExpression `(function() {
      ${block}
    })()`;
  }

  transformPropertyMethodAssignment_(tree, protoName) {
    var formalParameterList = this.transformAny(tree.formalParameterList);
    var functionBody = this.transformSuperInFunctionBody_(tree,
        tree.functionBody, protoName);
    if (!tree.isStatic &&
        formalParameterList === tree.formalParameterList &&
        functionBody === tree.functionBody) {
      return tree;
    }

    var isStatic = false;
    return new PropertyMethodAssignment(tree.location, isStatic,
        tree.isGenerator, tree.name, formalParameterList, functionBody);
  }

  transformGetAccessor_(tree, protoName) {
    var body = this.transformSuperInFunctionBody_(tree, tree.body, protoName);
    if (!tree.isStatic && body === tree.body)
      return tree;
    // not static
    return new GetAccessor(tree.location, false, tree.name, body);
  }

  transformSetAccessor_(tree, protoName) {
    var parameter = this.transformAny(tree.parameter);
    var body = this.transformSuperInFunctionBody_(tree, tree.body, protoName);
    if (!tree.isStatic && body === tree.body)
      return tree;
    return new SetAccessor(tree.location, false, tree.name, parameter,
                           body);
  }

  transformSuperInFunctionBody_(methodTree, tree, protoName) {
    this.pushTempVarState();
    var thisName = this.getTempIdentifier();
    var thisDecl = createVariableStatement(VAR, thisName,
                                           createThisExpression());
    var superTransformer = new SuperTransformer(this, this.runtimeInliner_,
        this.reporter_, protoName, methodTree, thisName);
    // ref_1: the inner transformFunctionBody call is key to proper super nesting.
    var transformedTree =
        superTransformer.transformFunctionBody(this.transformFunctionBody(tree));

    if (tree != transformedTree) {
      if (methodTree.isStatic)
        this.state_.hasStaticSuper = true;
      else
        this.state_.hasSuper = true;
    }

    this.popTempVarState();

    if (superTransformer.nestedSuper)
      return createFunctionBody([thisDecl].concat(transformedTree.statements));
    return transformedTree;
  }

  getDefaultConstructor_(tree, hasSuper, protoName) {
    // constructor(...args) { super(...args); }
    var constr = this.getDefaultConstructorFunction_(tree, hasSuper, protoName);
    return parsePropertyDefinition `constructor: ${constr}`;
  }

  getDefaultConstructorFunction_(tree, hasSuper, protoName) {
    if (!hasSuper)
      return parseExpression `function() {}`;
    return parseExpression `function() {
      ${this.getDefaultConstructorBody_(tree, protoName)};
    }`;
  }

  getDefaultConstructorBody_(tree, protoName) {
    var superTransformer = new SuperTransformer(this, this.runtimeInliner_,
        this.reporter_, protoName, null, null);
    var superCall = superTransformer.createSuperCallExpression(
        createThisExpression(),
        protoName,
        'constructor',
        id('arguments'));
    return parseStatement `${protoName} !== null && ${superCall}`;
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {RuntimeInliner} runtimeInliner
   * @param {ErrorReporter} reporter
   * @param {Script} tree
   * @return {Script}
   */
  static transformTree(identifierGenerator, runtimeInliner, reporter, tree) {
    return new this(identifierGenerator, runtimeInliner, reporter).
        transformAny(tree);
  }
}

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
import {
  LET,
  VAR
} from '../syntax/TokenType';
import {
  createFunctionBody,
  createIdentifierExpression,
  createMemberExpression,
  createObjectLiteralExpression,
  createParenExpression,
  createThisExpression,
  createVariableStatement
} from './ParseTreeFactory';
import {parseOptions} from '../options';
import {
  parseExpression,
  parsePropertyDefinition
} from './PlaceholderParser';
import {propName} from '../staticsemantics/PropName';

// This code is more or less identical to ClassDefinitionEvaluation in the ES6
// draft.
var CREATE_CLASS_CODE =
    `function(object, staticObject, protoParent, superClass, hasConstructor) {
      var ctor = object.constructor;
      if (typeof superClass === 'function')
        ctor.__proto__ = superClass;
      if (!hasConstructor && protoParent === null)
        ctor = object.constructor = function() {};

      var descriptors = %getDescriptors(object);
      descriptors.constructor.enumerable = false;
      ctor.prototype = Object.create(protoParent, descriptors);
      Object.defineProperties(ctor, %getDescriptors(staticObject));

      return ctor;
    }`;

var GET_PROTO_PARENT_CODE =
    `function(superClass) {
      if (typeof superClass === 'function') {
        var prototype = superClass.prototype;
        if (Object(prototype) === prototype || prototype === null)
          return superClass.prototype;
      }
      if (superClass === null)
        return null;
      throw new TypeError();
    }`;

var CREATE_CLASS_NO_EXTENDS_CODE =
    `function(object, staticObject) {
      var ctor = object.constructor;
      Object.defineProperty(object, 'constructor', {enumerable: false});
      ctor.prototype = object;
      Object.defineProperties(ctor, %getDescriptors(staticObject));
      return ctor;
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
 *   let C = traceurRuntime.createClass({
 *      constructor: function C(x) {
 *         traceurRuntime.superCall(this, C, 'constructor', [x]);
 *      },
 *      method: function method() {
 *        traceurRuntime.superCall(this, C, 'm', []);
 *      }
 *   });
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
  }

  transformClassShared_(tree, name) {
    var superClass = this.transformAny(tree.superClass);
    var nameIdent = createIdentifierExpression(name);
    var protoName = createIdentifierExpression('$__proto');
    var hasConstructor = false;
    var protoElements = [], staticElements = [];
    // For static methods the base for super calls is the RHS of the
    // extends (or Function.prototype if there is no extends clause).
    var staticSuperRef = superClass ?
        createIdentifierExpression('$__super') :
        createMemberExpression('Function', 'prototype');

    tree.elements.forEach((tree) => {
      var elements, proto;
      if (tree.isStatic) {
        elements = staticElements;
        proto = staticSuperRef;
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
          if (!tree.isStatic && propName(tree) === CONSTRUCTOR)
            hasConstructor = true;
          elements.push(this.transformPropertyMethodAssignment_(tree, proto));
          break;

        default:
          throw new Error(`Unexpected class element: ${tree.type}`);
      }
    });

    // Create constructor if it does not already exist.
    if (!hasConstructor) {
      protoElements.unshift(this.getDefaultConstructor_(tree, superClass,
                                                        protoName));
    }

    var object = createObjectLiteralExpression(protoElements);
    var staticObject = createObjectLiteralExpression(staticElements);

    // We branch on whether we have an extends expression or not since when
    // there is one, setting up the prototype chains gets a lot more
    // complicated.
    //
    // We also need to keep track if there was a user provided constructor or
    // not in case the extends expression evaluates to null; in that case we
    // change the default constructor to not call super. That is an just an
    // optimization, we could let the default constructor do this check at
    // runtime.
    //
    // The extra parentheses around createClass_ is to make the V8 heuristic
    // ignore that part in the name to use in its stack traces.
    if (superClass) {
      return parseExpression `function($__super) {
        'use strict';
        var $__proto = ${this.getProtoParent_}($__super);
        var ${nameIdent} =
            (${this.createClass_})(${object}, ${staticObject}, $__proto,
                                   $__super, ${hasConstructor});
        return ${nameIdent};
      }(${superClass})`;
    }

    return parseExpression `function() {
      'use strict';
      var ${nameIdent} = (${this.createClassNoExtends_})(
          ${object}, ${staticObject});
      return ${nameIdent};
    }()`;
  }

  get createClass_() {
    return this.runtimeInliner_.get('createClass', CREATE_CLASS_CODE);
  }

  get getProtoParent_() {
    return this.runtimeInliner_.get('getProtoParent', GET_PROTO_PARENT_CODE);
  }

  get createClassNoExtends_() {
    return this.runtimeInliner_.get('createClassNoExtends',
                                    CREATE_CLASS_NO_EXTENDS_CODE);
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
    var name = '$' + tree.name.identifierToken.value;
    return createVariableStatement(
        // If we allow let in the parser; use let. This let will be transformed
        // by the block binding transformer as needed.
        parseOptions.blockBinding ? LET : VAR,
        tree.name,
        this.transformClassShared_(tree, name));
  }

  transformClassExpression(tree) {
    var ident = tree.name ? tree.name.identifierToken.value : this.addTempVar();
    return createParenExpression(this.transformClassShared_(tree, ident));
  }

  transformPropertyMethodAssignment_(tree, protoName) {
    var formalParameterList = this.transformAny(tree.formalParameterList);
    var functionBody = this.transformSuperInFunctionBody_(tree, tree.functionBody,
                                                   protoName);
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

    this.popTempVarState();

    if (superTransformer.nestedSuper)
      return createFunctionBody([thisDecl].concat(transformedTree.statements));
    return transformedTree;
  }

  getDefaultConstructor_(tree, hasSuper, protoName) {
    // constructor(...args) { super(...args); }
    if (!hasSuper)
      return parsePropertyDefinition `constructor: function() {}`;

    var superTransformer = new SuperTransformer(this, this.runtimeInliner_,
        this.reporter_, protoName, null, null);
    var superCall = superTransformer.createSuperCallExpression(
        createThisExpression(),
        protoName,
        'constructor',
        createIdentifierExpression('arguments'));

    // Manually handle rest+spread to remove slice.
    return parsePropertyDefinition `constructor: function() {
      ${superCall};
    }`;
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

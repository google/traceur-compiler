// Copyright 2012 Google Inc.
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
  CONSTRUCTOR,
  CREATE_CLASS,
  RUNTIME,
  TRACEUR
} from '../syntax/PredefinedName.js';
import {
  FormalParameterList,
  FunctionDeclaration,
  GetAccessor,
  PropertyMethodAssignment,
  PropertyNameAssignment,
  SetAccessor,
  SuperExpression
} from '../syntax/trees/ParseTrees.js';
import {
  GET_ACCESSOR,
  PROPERTY_METHOD_ASSIGNMENT,
  SET_ACCESSOR
} from '../syntax/trees/ParseTreeType.js';
import SuperTransformer from 'SuperTransformer.js';
import TempVarTransformer from 'TempVarTransformer.js';
import TokenType from '../syntax/TokenType.js';
import {
  createArgumentList,
  createAssignmentExpression,
  createBlock,
  createBooleanLiteral,
  createCallExpression,
  createExpressionStatement,
  createFunctionExpression,
  createIdentifierExpression,
  createIdentifierToken,
  createMemberExpression,
  createNullLiteral,
  createObjectLiteralExpression,
  createParenExpression,
  createPropertyNameAssignment,
  createRestParameter,
  createSpreadExpression,
  createThisExpression,
  createVariableStatement
} from 'ParseTreeFactory.js';
import transformOptions from '../options.js';
import {
  parseExpression,
  parsePropertyDefinition
} from 'PlaceholderParser.js';

// This code is more or less identical to ClassDefinitionEvaluation in the ES6
// draft.
var CREATE_CLASS_CODE =
    `function(object, superClass, hasConstructor) {
      var ctor = object.constructor, protoParent;
      if (typeof superClass === 'function') {
        protoParent = superClass.prototype;
        if (protoParent === null)
          throw new TypeError();
        ctor.__proto__ = superClass;
      } else if (superClass === null) {
        if (!hasConstructor)
          ctor = object.constructor = function() {};
        protoParent = null;
      } else if (Object(superClass) === superClass) {
        protoParent = superClass;
      } else {
        throw new TypeError();
      }

      var descriptors = {}, name,
          names = Object.getOwnPropertyNames(object);
      for (var i = 0; i < names.length; i++) {
        var name = names[i];
        descriptors[name] = Object.getOwnPropertyDescriptor(object, name);
      }
      descriptors.constructor.enumerable = false;
      ctor.prototype = Object.create(protoParent, descriptors);

      return ctor;
    }`;

var CREATE_CLASS_NO_EXTENDS_CODE =
    `function(object) {
      var ctor = object.constructor;
      Object.defineProperty(object, 'constructor', {enumerable: false});
      ctor.prototype = object;
      return ctor;
    }`;

/*
 * Interaction between ClassTransformer and SuperTransformer:
 * - The initial call to SuperTransformer will always be a transformBlock on
 *   the body of a function -- method, getter, setter, or constructor.
 * - SuperTransformer will never see anything that has not been touched first
 *   by ClassTransformer and (if applicable) a previous invocation of
 *   SuperTransformer on the functions of any inner classes. [see ref_1]
 * - This means that SuperTransformer should only ever see desugared class
 *   declarations, and should never see any super expressions that refer to
 *   any inner (or outer) classes.
 */

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
 *   let C = traceur.runtime.createClass({
 *      constructor: function C(x) {
 *         traceur.runtime.superCall(this, C, 'constructor', [x]);
 *      },
 *      method: function method() {
 *        traceur.runtime.superCall(this, C, 'm', []);
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

    var hasConstructor = false;
    var elements = tree.elements.map((tree) => {
      switch (tree.type) {
        case GET_ACCESSOR:
          return this.transformGetAccessor_(tree, nameIdent);
        case SET_ACCESSOR:
          return this.transformSetAccessor_(tree, nameIdent);
        case PROPERTY_METHOD_ASSIGNMENT:
          if (tree.name.value === CONSTRUCTOR)
            hasConstructor = true;
          return this.transformPropertyMethodAssignment_(tree, nameIdent);
        default:
          throw new Error(`Unexpected class element: ${tree.type}`);
      }
    });

    // Create constructor if it does not already exist.
    if (!hasConstructor)
      elements.unshift(this.getDefaultConstructor_(tree, superClass,
                                                   nameIdent));

    var object = createObjectLiteralExpression(elements);

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
        var ${nameIdent} =
            (${this.createClass_})(${object}, $__super, ${hasConstructor});
        return ${nameIdent};
      }(${superClass})`;
    }

    return parseExpression `function() {
      var ${nameIdent} = (${this.createClassNoExtends_})(${object});
      return ${nameIdent};
    }()`;
  }

  get createClass_() {
    return this.runtimeInliner_.get('createClass', CREATE_CLASS_CODE);
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
        transformOptions.blockBinding ? TokenType.LET : TokenType.VAR,
        tree.name,
        this.transformClassShared_(tree, name));
  }

  transformClassExpression(tree) {
    var ident = tree.name ? tree.name.identifierToken.value : this.addTempVar();
    return this.transformClassShared_(tree, ident);
  }

  transformPropertyMethodAssignment_(tree, name) {
    var formalParameterList = this.transformAny(tree.formalParameterList);
    var functionBody = this.transformSuperInBlock_(tree, tree.functionBody,
                                                   name);
    if (formalParameterList === tree.formalParameterList &&
        functionBody === tree.functionBody) {
      return tree;
    }

    return new PropertyMethodAssignment(tree.location, tree.name,
        tree.isGenerator, formalParameterList, functionBody);
  }

  transformGetAccessor_(tree, name) {
    var body = this.transformSuperInBlock_(tree, tree.body, name);
    if (body === tree.body)
      return tree;
    return new GetAccessor(tree.location, tree.name, body);
  }

  transformSetAccessor_(tree, name) {
    var parameter = this.transformAny(tree.parameter);
    var body = this.transformSuperInBlock_(tree, tree.body, name);
    if (body === tree.body)
      return tree;
    return new SetAccessor(tree.location, tree.name, parameter, body);
  }

  transformSuperInBlock_(methodTree, tree, className) {
    this.pushTempVarState();
    var thisName = this.getTempIdentifier();
    var thisDecl = createVariableStatement(TokenType.VAR, thisName,
                                           createThisExpression());
    var superTransformer = new SuperTransformer(this, this.reporter_,
                                                className, methodTree,
                                                thisName);
    // ref_1: the inner transformBlock call is key to proper super nesting.
    var transformedTree =
        superTransformer.transformBlock(this.transformBlock(tree));

    this.popTempVarState();

    if (superTransformer.nestedSuper)
      return createBlock([thisDecl].concat(transformedTree.statements));
    return transformedTree;
  }

  getDefaultConstructor_(tree, hasSuper, name) {
    // constructor(...args) { super(...args); }
    if (!hasSuper)
      return parsePropertyDefinition `constructor: function() {}`;

    // Manually handle rest+spread to remove slice.
    return parsePropertyDefinition `constructor: function() {
      traceur.runtime.superCall(this, ${name}, 'constructor', arguments);
    }`;
  }
}

/**
 * @param {UniqueIdentifierGenerator} identifierGenerator
 * @param {RuntimeInliner} runtimeInliner
 * @param {ErrorReporter} reporter
 * @param {Program} tree
 * @return {Program}
 */
ClassTransformer.transform = function(identifierGenerator, runtimeInliner,
                                      reporter, tree) {
  return new ClassTransformer(identifierGenerator, runtimeInliner, reporter).
      transformAny(tree);
};

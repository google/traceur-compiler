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

// The state keeps track of the current class tree and class name.
var stack = [];

class State {
  constructor(classTree) {
    this.tree = classTree;
    this.name = null;
    this.hasSuper = false;
  }
}

function peekState() {
  return stack[stack.length - 1];
}

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
   * @param {ErrorReporter} reporter
   */
  constructor(identifierGenerator, reporter) {
    super(identifierGenerator);
    this.reporter_ = reporter;
  }

  transformClassShared_(tree, name) {
    var superClass = this.transformAny(tree.superClass);

    var state = new State(tree);
    stack.push(state);
    state.name = createIdentifierExpression(name);

    var constructor;
    var elements = tree.elements.map((tree) => {
      switch (tree.type) {
        case GET_ACCESSOR:
          return this.transformGetAccessor_(tree);
        case SET_ACCESSOR:
          return this.transformSetAccessor_(tree);
        case PROPERTY_METHOD_ASSIGNMENT:
          if (tree.name.value === CONSTRUCTOR)
            return constructor = this.transformConstructor_(tree);
          return this.transformPropertyMethodAssignment_(tree);
        default:
          throw new Error(`Unexpected class element: ${tree.type}`);
      }
    });

    // Create constructor if it does not already exist.
    if (!constructor)
      elements.push(this.getDefaultConstructor_(tree));

    stack.pop();

    // We need to keep track of whether we have a user defined constructor or
    // not in case we extend null.
    var hasConstructor = !!constructor;
    // A missing extends expression needs to be treated slightly different
    // from extending Object.
    var hasExtendsExpression = !!superClass;

    // let <className> = traceur.runtime.createClass(proto, superClass,
    //                                               hasConstructor,
    //                                               hasExtendsExpression)
    return [
      createCallExpression(
          createMemberExpression(TRACEUR, RUNTIME, CREATE_CLASS),
          createArgumentList(
              createObjectLiteralExpression(elements),
              superClass || createNullLiteral(),
              createBooleanLiteral(hasConstructor),
              createBooleanLiteral(hasExtendsExpression))),
      state.hasSuper
    ];
  }

  /**
   * Transforms a single class declaration
   *
   * @param {ClassDeclaration} tree
   * @return {ParseTree}
   */
  transformClassDeclaration(tree) {
    // let <className> = traceur.runtime.createClass(proto, superClass)
    return createVariableStatement(
        transformOptions.blockBinding ? TokenType.LET : TokenType.VAR,
        tree.name,
        this.transformClassShared_(tree, tree.name.identifierToken)[0]);
  }

  transformClassExpression(tree) {
    var tempIdent = this.addTempVar();
    var transformResult = this.transformClassShared_(tree, tempIdent);
    var classTree = transformResult[0];
    var hasSuper =  transformResult[1];
    if (hasSuper) {
      return createParenExpression(
          createAssignmentExpression(
              createIdentifierExpression(tempIdent),
              classTree));
    }

    return classTree;
  }

  transformPropertyMethodAssignment_(tree) {
    var formalParameterList = this.transformAny(tree.formalParameterList);
    var functionBody = this.transformSuperInBlock_(tree, tree.functionBody);
    if (formalParameterList === tree.formalParameterList &&
        functionBody === tree.functionBody) {
      return tree;
    }

    return new PropertyMethodAssignment(tree.location, tree.name,
        tree.isGenerator, formalParameterList, functionBody);
  }

  transformGetAccessor_(tree) {
    var body = this.transformSuperInBlock_(tree, tree.body);
    if (body === tree.body)
      return tree;
    return new GetAccessor(tree.location, tree.name, body);
  }

  transformSetAccessor_(tree) {
    var parameter = this.transformAny(tree.parameter);
    var body = this.transformSuperInBlock_(tree, tree.body);
    if (body === tree.body)
      return tree;
    return new SetAccessor(tree.location, tree.name, parameter, body);
  }

  transformConstructor_(tree) {
    // The constructor is transformed into a property assignment.
    // constructor: function CLASS_NAME() { }
    var state = peekState();
    var parameters = this.transformAny(tree.formalParameterList);
    var functionBody = this.transformSuperInBlock_(tree, tree.functionBody);

    var func = createFunctionExpression(parameters, functionBody);
    return createPropertyNameAssignment(CONSTRUCTOR, func);
  }

  transformSuperInBlock_(methodTree, tree) {
    this.pushTempVarState();
    var state = peekState();
    var className = state.name;
    var thisName = this.getTempIdentifier();
    var thisDecl = createVariableStatement(TokenType.VAR, thisName,
                                           createThisExpression());
    var superTransformer = new SuperTransformer(this, this.reporter_,
                                                className, methodTree,
                                                thisName);
    // ref_1: the inner transformBlock call is key to proper super nesting.
    var transformedTree =
        superTransformer.transformBlock(this.transformBlock(tree));
    if (superTransformer.hasSuper)
      state.hasSuper = true;

    this.popTempVarState();

    if (superTransformer.nestedSuper)
      return createBlock([thisDecl].concat(transformedTree.statements));
    return transformedTree;
  }

  getDefaultConstructor_(tree) {
    // function name(...args) {
    //   super(...args)
    // }
    var restParam = createRestParameter('args');
    var params = new FormalParameterList(null, [restParam]);
    var body = createBlock(
        createExpressionStatement(
            createCallExpression(
                new SuperExpression(null),
                createArgumentList(
                    createSpreadExpression(
                        createIdentifierExpression('args'))))));
    var constr = new PropertyMethodAssignment(null,
        createIdentifierToken(CONSTRUCTOR), false,
                              params, body);
    return this.transformConstructor_(constr);
  }
}

/**
 * @param {UniqueIdentifierGenerator} identifierGenerator
 * @param {ErrorReporter} reporter
 * @param {Program} tree
 * @return {Program}
 */
ClassTransformer.transform = function(identifierGenerator, reporter, tree) {
  return new ClassTransformer(identifierGenerator, reporter).
      transformAny(tree);
};

// Copyright 2011 Google Inc.
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

traceur.define('codegeneration', function() {
  'use strict';

  var FunctionDeclaration = traceur.syntax.trees.FunctionDeclaration;
  var GetAccessor = traceur.syntax.trees.GetAccessor;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var PredefinedName = traceur.syntax.PredefinedName;
  var PropertyMethodAssignment = traceur.syntax.trees.PropertyMethodAssignment;
  var PropertyNameAssignment = traceur.syntax.trees.PropertyNameAssignment;
  var SetAccessor = traceur.syntax.trees.SetAccessor;
  var SuperTransformer = traceur.codegeneration.SuperTransformer;
  var TempVarTransformer = traceur.codegeneration.TempVarTransformer;
  var TokenType = traceur.syntax.TokenType;

  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var createArgumentList = ParseTreeFactory.createArgumentList;
  var createAssignmentExpression = ParseTreeFactory.createAssignmentExpression;
  var createCallExpression = ParseTreeFactory.createCallExpression;
  var createEmptyParameterList = ParseTreeFactory.createEmptyParameterList;
  var createEmptyBlock = ParseTreeFactory.createEmptyBlock;
  var createFunctionDeclaration = ParseTreeFactory.createFunctionDeclaration;
  var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createObjectLiteralExpression = ParseTreeFactory.createObjectLiteralExpression;
  var createParenExpression = ParseTreeFactory.createParenExpression;
  var createPropertyNameAssignment = ParseTreeFactory.createPropertyNameAssignment;
  var createVariableStatement = ParseTreeFactory.createVariableStatement;

  // The state keeps track of the current class tree and class name.
  var stack = [];

  function State(classTree) {
    this.tree = classTree;
    this.name = null;
    this.hasSuper = false;
  }

  function peekState() {
    return stack[stack.length - 1];
  }

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
   *
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ErrorReporter} reporter
   * @constructor
   * @extends {TempVarTransformer}
   */
  function ClassTransformer(identifierGenerator, reporter) {
    TempVarTransformer.call(this, identifierGenerator);
    this.reporter_ = reporter;
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

  var proto = TempVarTransformer.prototype;
  ClassTransformer.prototype = traceur.createObject(proto, {

    transformClassShared_: function(tree, name) {
      var superClass = this.transformAny(tree.superClass);

      var state = new State(tree);
      stack.push(state);
      state.name = createIdentifierExpression(name);

      var constructor;
      var elements = [];
      tree.elements.forEach(function(tree) {
        switch (tree.type) {
          case ParseTreeType.GET_ACCESSOR:
            elements.push(this.transformGetAccessor_(tree));
            return;
          case ParseTreeType.SET_ACCESSOR:
            elements.push(this.transformSetAccessor_(tree));
            return;
          case ParseTreeType.PROPERTY_METHOD_ASSIGNMENT:
            if (tree.name.value === PredefinedName.CONSTRUCTOR)
              constructor = this.transformConstructor_(tree);
            else
              elements.push(this.transformPropertyMethodAssignment_(tree));
            return;
          default:
            throw new Error('Unexpected class element: ' + tree.type);
        }
      }, this);

      // Create constructor if it does not already exist.
      if (!constructor) {
        constructor = createFunctionDeclaration(tree.name,
            createEmptyParameterList(), createEmptyBlock());
      }

      stack.pop();

      // let <className> = traceur.runtime.createClass(proto, superClass)
      return [
        createCallExpression(
            createMemberExpression(
                PredefinedName.TRACEUR,
                PredefinedName.RUNTIME,
                PredefinedName.CREATE_CLASS),
            createArgumentList(
                constructor,
                createObjectLiteralExpression(elements),
                superClass || createIdentifierExpression(PredefinedName.OBJECT))),
        state.hasSuper
      ];
    },

    /**
     * Transforms a single class declaration
     *
     * @param {ClassDeclaration} tree
     * @return {ParseTree}
     */
    transformClassDeclaration: function(tree) {
      // let <className> = traceur.runtime.createClass(proto, superClass)
      return createVariableStatement(
          TokenType.LET,
          tree.name,
          this.transformClassShared_(tree, tree.name.identifierToken)[0]);
    },

    transformClassExpression: function(tree) {
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

      this.removeTempVar(tempIdent);
      return classTree;
    },

    transformPropertyMethodAssignment_: function(tree) {
      var formalParameterList = this.transformAny(tree.formalParameterList);
      var functionBody = this.transformSuperInBlock_(tree, tree.functionBody);
      if (formalParameterList === tree.formalParameterList &&
          functionBody === tree.functionBody) {
        return tree;
      }

      return new PropertyMethodAssignment(tree.location, tree.name,
          tree.isGenerator, formalParameterList, functionBody);
    },

    transformGetAccessor_: function(tree) {
      var body = this.transformSuperInBlock_(tree, tree.body);
      if (body === tree.body)
        return tree;
      return new GetAccessor(tree.location, tree.propertyName, body);
    },

    transformSetAccessor_: function(tree) {
      var parameter = this.transformAny(tree.parameter);
      var body = this.transformSuperInBlock_(tree, tree.body);
      if (body === tree.body)
        return tree;
      return new SetAccessor(tree.location, tree.propertyName, parameter, body);
    },

    transformConstructor_: function(tree) {
      var state = peekState();
      var parameters = this.transformAny(tree.formalParameterList);
      var functionBody = this.transformSuperInBlock_(tree, tree.functionBody);
      var name = state.name.identifierToken;
      return createFunctionDeclaration(name, parameters, functionBody);
    },

    transformSuperInBlock_: function(methodTree, tree) {
      var state = peekState();
      var className = state.name;
      var superTransformer = new SuperTransformer(this, this.reporter_,
                                                  className, methodTree);
      var transformedTree = superTransformer.transformAny(proto.transformAny.call(this, tree));
      if (superTransformer.hasSuper)
        state.hasSuper = true;
      return transformedTree;
    }
  });

  return {
    ClassTransformer: ClassTransformer
  };
});

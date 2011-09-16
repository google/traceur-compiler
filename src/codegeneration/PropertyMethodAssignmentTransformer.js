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

  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var createArgumentList = ParseTreeFactory.createArgumentList;
  var createArrayLiteralExpression = ParseTreeFactory.createArrayLiteralExpression;
  var createCallExpression = ParseTreeFactory.createCallExpression;
  var createFunctionDeclaration = ParseTreeFactory.createFunctionDeclaration;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createObjectLiteralExpression = ParseTreeFactory.createObjectLiteralExpression;
  var createStringLiteral = ParseTreeFactory.createStringLiteral;
  var TokenType = traceur.syntax.TokenType;
  var LiteralExpression = traceur.syntax.trees.LiteralExpression;
  var PropertyNameAssignment = traceur.syntax.trees.PropertyNameAssignment;
  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;
  var MARK_METHODS = traceur.syntax.PredefinedName.MARK_METHODS;
  var RUNTIME = traceur.syntax.PredefinedName.RUNTIME;
  var TRACEUR = traceur.syntax.PredefinedName.TRACEUR;

  var methodStack = [];

  function addMethod(token) {
    methodStack[methodStack.length - 1].push(token);
  }

  /**
   * This takes an object literal and an array of method names (tokens) that
   * needs to be marked as methods. For example:
   *
   * {
   *   a: function() {},
   *   'var', function() {},
   *   42: function() {}
   * }
   *
   * with the |methods| set to the tokens of [a, 'var', 42].
   *
   * We need to generate the following code:
   *
   * traceur.runtime.markAsMethods({...}, ['a', 'var', '42'])
   *
   * where the runtime method sets the enumerable flag to false on these
   * properties.
   */
  function markMethods(objectLit, methodTokens) {
    // traceur.runtime.markMethods
    var markMethods = createMemberExpression(TRACEUR, RUNTIME, MARK_METHODS);

    // Transform all the tokens to string expressions parse trees.
    var methodNames = methodTokens.map(function(token) {
      if (token.type == TokenType.STRING)
        return new LiteralExpression(null, token);
      return createStringLiteral(token.toString());
    });

    return createCallExpression(markMethods, createArgumentList(objectLit,
                                createArrayLiteralExpression(methodNames)));
  }

  /**
   * Desugars property method assignments.
   *
   * @see <a href="http://wiki.ecmascript.org/doku.php?id=harmony:concise_object_literal_extensions#methods">harmony:concise_object_literal_extensions#methods</a>
   *
   * @extends {ParseTreeTransformer}
   * @constructor
   */
  function PropertyMethodAssignmentTransformer() {}

  PropertyMethodAssignmentTransformer.transformTree = function(tree) {
    return new PropertyMethodAssignmentTransformer().transformAny(tree);
  };

  PropertyMethodAssignmentTransformer.prototype = traceur.createObject(
      ParseTreeTransformer.prototype, {

    /**
     * @param {ObjectLiteralExpression} tree
     * @return {ParseTree}
     */
    transformObjectLiteralExpression: function(tree) {
      // As we visit all the parts of the object literal we gather the methods.
      // When we get back we check if any methods were found and we do the
      // transformation as needed.
      methodStack.push([]);

      var propertyNameAndValues =
          this.transformList(tree.propertyNameAndValues);
      if (propertyNameAndValues == tree.propertyNameAndValues) {
        // No transformations done so that means that we didn't have any
        // methods.
        methodStack.pop();
        return tree;
      }

      var methods = methodStack.pop();
      var literal = createObjectLiteralExpression(propertyNameAndValues);

      // No methods found.
      if (!methods.length)
         return literal;

      return markMethods(literal, methods);
    },

    transformPropertyMethodAssignment: function(tree) {
      addMethod(tree.name);

      var parameters = this.transformAny(tree.formalParameterList);
      var functionBody = this.transformAny(tree.functionBody);

      // If the name is an Identifier we use that as the name of the function
      // so that it is visible inside the function scope.
      var name = null;
      if (tree.name.type == TokenType.IDENTIFIER)
        name = tree.name;

      var fun = createFunctionDeclaration(name, parameters, functionBody);
      return new PropertyNameAssignment(tree.location, tree.name, fun);
    }
  });

  return {
    PropertyMethodAssignmentTransformer: PropertyMethodAssignmentTransformer
  };
});

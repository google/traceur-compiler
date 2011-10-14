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

  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;
  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var createCallExpression = ParseTreeFactory.createCallExpression;
  var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createArgumentList = ParseTreeFactory.createArgumentList;
  var createArrayLiteralExpression = ParseTreeFactory.createArrayLiteralExpression;
  var createObjectFreeze = ParseTreeFactory.createObjectFreeze;
  var createObjectLiteralExpression = ParseTreeFactory.createObjectLiteralExpression;
  var createPropertyNameAssignment = ParseTreeFactory.createPropertyNameAssignment;
  var createVariableDeclaration = ParseTreeFactory.createVariableDeclaration;
  var createVariableDeclarationList = ParseTreeFactory.createVariableDeclarationList;
  var createVariableStatement = ParseTreeFactory.createVariableStatement;

  var LiteralExpression = traceur.syntax.trees.LiteralExpression;
  var Program = traceur.syntax.trees.Program;
  var LiteralToken = traceur.syntax.LiteralToken;
  var PredefinedName = traceur.syntax.PredefinedName;
  var TokenType = traceur.syntax.TokenType;

  function getQuasiFunction(name) {
    if (name) {
      return createIdentifierExpression(name);
    }
    return createMemberExpression(PredefinedName.TRACEUR,
                                  PredefinedName.RUNTIME,
                                  PredefinedName.DEFAULT_QUASI);
  }

  /**
   * Creates an object like:
   * Object.freeze({
   *   raw: Object.freeze(["literalPortion\\0 ", "literalPortion1"]),
   *   cooked: Object.freeze(["literalPortion\u0000 ", "literalPortion1"])
   * })
   */
  function createCallSiteIdObject(tree) {
    var elements = tree.elements;
    var isDefault = tree.name == null;
    var cookedProperty = createPropertyNameAssignment(
        PredefinedName.COOKED,
        createObjectFreeze(createCookedStringArray(elements)));

    // The default quasi does not need the cooked part.
    if (isDefault) {
      return createObjectFreeze(createObjectLiteralExpression(cookedProperty));
    }

    return createObjectFreeze(createObjectLiteralExpression(
      createPropertyNameAssignment(
          PredefinedName.RAW,
          createObjectFreeze(createRawStringArray(elements))),
      cookedProperty));
  }

  function createRawStringArray(elements) {
    var items = [];
    for (var i = 0; i < elements.length; i += 2) {
      var str = replaceRaw(JSON.stringify(elements[i].value.value));
      var expr = new LiteralExpression(null, new LiteralToken(TokenType.STRING,
                                                              str, null));
      items.push(expr);
    }
    return createArrayLiteralExpression(items);
  }

  function createCookedStringArray(elements) {
    var items = [];
    for (var i = 0; i < elements.length; i += 2) {
      var str = cookString(elements[i].value.value);
      var expr = new LiteralExpression(null, new LiteralToken(TokenType.STRING,
                                                              str, null));
      items.push(expr);
    }
    return createArrayLiteralExpression(items);
  }

  function replaceRaw(s) {
    return s.replace(/\u2028|\u2029/g, function(c) {
      switch (c) {
        case '\u2028':
          return '\\u2028';
        case '\u2029':
          return '\\u2029';
        default:
          throw Error('Not reachable');
      }
    });
  }

  /**
   * Takes a raw string and returns a string that is suitable for the cooked
   * value. This involves removing line continuations, escaping double quotes
   * and escaping whitespace.
   */
  function cookString(s) {
    var sb = ['"'];
    var i = 0, k = 1, c, c2;
    while (i < s.length) {
      c = s[i++];
      switch (c) {
        case '\\':
          c2 = s[i++];
          switch (c2) {
            // Strip line continuation.
            case '\n':
            case '\u2028':
            case '\u2029':
              break;
            case '\r':
              // \ \r \n should be stripped as one
              if (s[i + 1] === '\n') {
                i++;
              }
              break;

            default:
              sb[k++] = c;
              sb[k++] = c2;
          }
          break;

        // Since we wrap the string in " we need to escape those.
        case '"':
          sb[k++] = '\\"';
          break;

        // Whitespace
        case '\n':
          sb[k++] = '\\n';
          break;
        case '\r':
          sb[k++] = '\\r';
          break;
        case '\t':
          sb[k++] = '\\t';
          break;
        case '\f':
          sb[k++] = '\\f';
          break;
        case '\b':
          sb[k++] = '\\b';
          break;
        case '\u2028':
          sb[k++] = '\\u2028';
          break;
        case '\u2029':
          sb[k++] = '\\u2029';
          break;

        default:
          sb[k++] = c;
      }
    }

    sb[k++] = '"';
    return sb.join('');
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @extends {ParseTreeTransformer}
   */
  function QuasiLiteralTransformer(identifierGenerator) {
    ParseTreeTransformer.call(this);
    this.identifierGenerator_ = identifierGenerator;
  }

  /*
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  QuasiLiteralTransformer.transformTree = function(identifierGenerator, tree) {
    return new QuasiLiteralTransformer(identifierGenerator).transformAny(tree);
  };

  var proto = ParseTreeTransformer.prototype;
  QuasiLiteralTransformer.prototype = traceur.createObject(proto, {
    transformProgram: function(tree) {

      this.callsiteDecls_ = [];

      var elements = this.transformList(tree.programElements);
      if (elements == tree.programElements) {
        return tree;
      }

      traceur.assert(this.callsiteDecls_.length > 0);
      var varStatement = createVariableStatement(
          createVariableDeclarationList(TokenType.CONST, this.callsiteDecls_));
      elements.unshift(varStatement);

      return new Program(null, elements);
    },

    transformQuasiLiteralExpression: function(tree) {
      var elements = tree.elements;
      var args = [];

      var idName = this.identifierGenerator_.generateUniqueIdentifier();
      var callsiteId = createCallSiteIdObject(tree);
      var variableDecl = createVariableDeclaration(idName, callsiteId);
      this.callsiteDecls_.push(variableDecl);

      args.push(createIdentifierExpression(idName));

      for (var i = 1; i < elements.length; i += 2) {
        args.push(this.transformAny(elements[i]));
      }

      return createCallExpression(
          getQuasiFunction(tree.name),
          createArgumentList(args));
    },

    transformQuasiSubstitution: function(tree) {
      return this.transformAny(tree.expression);
    }
  });

  return {
    QuasiLiteralTransformer: QuasiLiteralTransformer
  };
});

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

  var LiteralExpression = traceur.syntax.trees.LiteralExpression;
  var LiteralToken = traceur.syntax.LiteralToken;
  var ParenExpression = traceur.syntax.trees.ParenExpression;
  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var PredefinedName = traceur.syntax.PredefinedName;
  var Program = traceur.syntax.trees.Program;
  var TokenType = traceur.syntax.TokenType;

  var createArgumentList = ParseTreeFactory.createArgumentList;
  var createArrayLiteralExpression = ParseTreeFactory.createArrayLiteralExpression;
  var createBinaryOperator = ParseTreeFactory.createBinaryOperator;
  var createCallExpression = ParseTreeFactory.createCallExpression;
  var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
  var createMemberExpression = ParseTreeFactory.createMemberExpression;
  var createObjectFreeze = ParseTreeFactory.createObjectFreeze;
  var createObjectLiteralExpression = ParseTreeFactory.createObjectLiteralExpression;
  var createOperatorToken = ParseTreeFactory.createOperatorToken;
  var createPropertyNameAssignment = ParseTreeFactory.createPropertyNameAssignment;
  var createVariableDeclaration = ParseTreeFactory.createVariableDeclaration;
  var createVariableDeclarationList = ParseTreeFactory.createVariableDeclarationList;
  var createVariableStatement = ParseTreeFactory.createVariableStatement;

  /**
   * Creates an object like:
   * Object.freeze({
   *   raw: Object.freeze(["literalPortion\\0 ", "literalPortion1"]),
   *   cooked: Object.freeze(["literalPortion\u0000 ", "literalPortion1"])
   * })
   */
  function createCallSiteIdObject(tree) {
    var elements = tree.elements;
    return createObjectFreeze(createObjectLiteralExpression(
      createPropertyNameAssignment(
          PredefinedName.RAW,
          createObjectFreeze(createRawStringArray(elements))),
      createPropertyNameAssignment(
          PredefinedName.COOKED,
          createObjectFreeze(createCookedStringArray(elements)))));
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

  function createCookedStringLiteralExpression(tree) {
    var str = cookString(tree.value.value);
    return new LiteralExpression(null, new LiteralToken(TokenType.STRING,
                                                        str, null));
  }

  function createCookedStringArray(elements) {
    var items = [];
    for (var i = 0; i < elements.length; i += 2) {
      items.push(createCookedStringLiteralExpression(elements[i]));
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

      if (this.callsiteDecls_.length > 0) {
        var varStatement = createVariableStatement(
            createVariableDeclarationList(TokenType.CONST,
                                          this.callsiteDecls_));
        elements.unshift(varStatement);
      }

      return new Program(tree.location, elements);
    },

    transformQuasiLiteralExpression: function(tree) {
      if (!tree.name)
        return this.createDefaultQuasi(tree);

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
          createIdentifierExpression(tree.name),
          createArgumentList(args));
    },

    transformQuasiSubstitution: function(tree) {
      var transformedTree = this.transformAny(tree.expression);
      // Wrap in a paren expression if needed.
      switch (transformedTree.type) {
        case ParseTreeType.BINARY_OPERATOR:
          // Only * / and % have higher priority than +.
          switch (transformedTree.operator.type) {
            case TokenType.STAR:
            case TokenType.PERCENT:
            case TokenType.SLASH:
              return transformedTree;
          }
          // Fall through.
        case ParseTreeType.COMMA_EXPRESSION:
        case ParseTreeType.CONDITIONAL_EXPRESSION:
          return new ParenExpression(null, transformedTree);
      }

      return transformedTree;
    },

    transformQuasiLiteralPortion: function(tree) {
      return createCookedStringLiteralExpression(tree);
    },

    createDefaultQuasi: function(tree) {
      // convert to ("a" + b + "c" + d + "")
      var length = tree.elements.length;
      var binaryExpression = this.transformAny(tree.elements[0]);
      if (length == 1)
        return binaryExpression;

      var plusToken = createOperatorToken(TokenType.PLUS);
      for (var i = 1; i < length; i++) {
        var element = tree.elements[i];
        if (element.type === ParseTreeType.QUASI_LITERAL_PORTION &&
            element.value.value === '') {
          continue;
        }
        var transformedTree = this.transformAny(tree.elements[i]);
        binaryExpression = createBinaryOperator(binaryExpression, plusToken,
                                                transformedTree);
      }

      return new ParenExpression(null, binaryExpression);
    }
  });

  return {
    QuasiLiteralTransformer: QuasiLiteralTransformer
  };
});

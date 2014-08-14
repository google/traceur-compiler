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
  ARGUMENT_LIST,
  BLOCK,
  EXPRESSION_STATEMENT,
  IDENTIFIER_EXPRESSION
} from '../syntax/trees/ParseTreeType';
import {IdentifierToken} from '../syntax/IdentifierToken';
import {LiteralToken} from '../syntax/LiteralToken';
import {Map} from '../runtime/polyfills/Map';
import {CollectingErrorReporter} from '../util/CollectingErrorReporter';
import {ParseTree} from '../syntax/trees/ParseTree';
import {ParseTreeTransformer} from './ParseTreeTransformer';
import {Parser} from '../syntax/Parser';
import {
  LiteralExpression,
  LiteralPropertyName
} from '../syntax/trees/ParseTrees';
import {SourceFile} from '../syntax/SourceFile';
import {IDENTIFIER} from '../syntax/TokenType';
import {
  createArrayLiteralExpression,
  createBindingIdentifier,
  createBlock,
  createBooleanLiteral,
  createCommaExpression,
  createExpressionStatement,
  createFunctionBody,
  createIdentifierExpression,
  createIdentifierToken,
  createMemberExpression,
  createNullLiteral,
  createNumberLiteral,
  createParenExpression,
  createStringLiteral,
  createVoid0
} from './ParseTreeFactory';

/**
 * @fileoverview This file provides two template string functions,
 * |parseExpression| and |parseStatement|, which parses a string with
 * placeholders. The values in the placeholders can be JS values, ParseTrees or
 * IdentifierTokens.
 *
 * For example:
 *
 *   parseExpression`function() { return ${myTree}; }`
 *
 * returns a FunctionDeclaration tree that returns |myTree|.
 *
 * At the moment placeholders are allowed where a BindingIdentifier and
 * IdentifierExpression are allowed.
 *
 * Beware that strings are treated as BindingIdentifiers in binding context but
 * string literals in expression context. To work around that pass in an
 * IdentifierToken.
 */

/**
 * Sentinel used for |getValue_| to signal no value was found.
 */
var NOT_FOUND = {};

var cache = new Map();

/**
 * @param {function(Parser) : ParseTree} doParse Function that calls the correct
 *     parse method on the parser.
 */
function makeParseFunction(doParse) {
  return (sourceLiterals, ...values) => parse(sourceLiterals, values, doParse);
}

/**
 * @param {Array.<string>} sourceLiterals
 * @param {Array} values An array containing values or parse trees.
 * @return {ParseTree}
 */
export var parseExpression = makeParseFunction((p) => p.parseExpression());
export var parseStatement = makeParseFunction((p) => p.parseStatement());
export var parseModule = makeParseFunction((p) => p.parseModule());
export var parseScript = makeParseFunction((p) => p.parseScript());
export var parseStatements = makeParseFunction((p) => p.parseStatements());
export var parsePropertyDefinition =
    makeParseFunction((p) => p.parsePropertyDefinition());

function parse(sourceLiterals, values, doParse) {
  var tree = cache.get(sourceLiterals);
  if (!tree) {
    var source = insertPlaceholderIdentifiers(sourceLiterals);
    var errorReporter = new CollectingErrorReporter();
    var parser = getParser(source, errorReporter);
    tree = doParse(parser);
    if (errorReporter.hadError() || !tree || !parser.isAtEnd()) {
      throw new Error(
          `Internal error trying to parse:\n\n${source}\n\n${
              errorReporter.errorsAsString()}`);
    }
    cache.set(sourceLiterals, tree);
  }
  if (!values.length)
    return tree;

  // We allow either a ParseTree or an Array as the result of doParse. An
  // array is returned for parseStatements.
  if (tree instanceof ParseTree)
    return new PlaceholderTransformer(values).transformAny(tree);
  return new PlaceholderTransformer(values).transformList(tree);
}

var PREFIX = '$__placeholder__';

/**
 * @param {Array.<string>} sourceLiterals
 * @return {string}
 */
function insertPlaceholderIdentifiers(sourceLiterals) {
  var source = sourceLiterals[0];
  for (var i = 1; i < sourceLiterals.length; i++) {
    source += PREFIX + (i - 1) + sourceLiterals[i];
  }
  return source;
}

var counter = 0;

function getParser(source, errorReporter) {
  var file = new SourceFile(
      '@traceur/generated/TemplateParser/' + counter++, source);
  var parser = new Parser(file, errorReporter);
  parser.allowYield = true;
  parser.allowAwait = true;
  return parser;
}

/**
 * @param {*} value
 * @return {ParseTree}
 */
function convertValueToExpression(value) {
  if (value instanceof ParseTree)
    return value;
  if (value instanceof IdentifierToken)
    return createIdentifierExpression(value);
  if (value instanceof LiteralToken)
    return new LiteralExpression(value.location, value);
  if (Array.isArray(value)) {
    if (value[0] instanceof ParseTree) {
      if (value.length === 1)
        return value[0];
      if (value[0].isStatement())
        return createBlock(value);
      else
        return createParenExpression(createCommaExpression(value));
    }
    return createArrayLiteralExpression(value.map(convertValueToExpression));
  }
  if (value === null)
    return createNullLiteral();
  if (value === undefined)
    return createVoid0();

  switch (typeof value) {
    case 'string':
      return createStringLiteral(value);
    case 'boolean':
      return createBooleanLiteral(value);
    case 'number':
      return createNumberLiteral(value);
  }

  throw new Error('Not implemented');
}

function convertValueToIdentifierToken(value) {
  if (value instanceof IdentifierToken)
    return value;
  return createIdentifierToken(value);
}

/**
 * Transforms a ParseTree containing placeholders.
 */
export class PlaceholderTransformer extends ParseTreeTransformer {
  /**
   * @param {Array} values The values to replace the placeholders with.
   */
  constructor(values) {
    super();
    this.values = values;
  }

  /**
   * This gets called by the transformer when the index'th placeholder is
   * going to be replaced.
   * @param {number} index
   * @return {ParseTree}
   */
  getValueAt(index) {
    return this.values[index];
  }

  /**
   *
   * @param {string} str
   * @return {*} This returns the |NOT_FOUND| sentinel if the |str| does not
   *     represent a placeholder.
   */
  getValue_(str) {
    if (str.indexOf(PREFIX) !== 0)
      return NOT_FOUND;
    return this.getValueAt(Number(str.slice(PREFIX.length)));
  }

  transformIdentifierExpression(tree) {
    var value = this.getValue_(tree.identifierToken.value);
    if (value === NOT_FOUND)
      return tree;
    return convertValueToExpression(value);
  }

  transformBindingIdentifier(tree) {
    var value = this.getValue_(tree.identifierToken.value);
    if (value === NOT_FOUND)
      return tree;
    return createBindingIdentifier(value);
  }

  transformExpressionStatement(tree) {
    if (tree.expression.type === IDENTIFIER_EXPRESSION) {
      var transformedExpression =
          this.transformIdentifierExpression(tree.expression);
      if (transformedExpression === tree.expression)
        return tree;
      if (transformedExpression.isStatement())
        return transformedExpression;
      return createExpressionStatement(transformedExpression);
    }
    return super(tree);
  }

  transformBlock(tree) {
    if (tree.statements.length === 1 &&
        tree.statements[0].type === EXPRESSION_STATEMENT) {
      var transformedStatement =
          this.transformExpressionStatement(tree.statements[0]);
      if (transformedStatement === tree.statements[0])
        return tree;
      if (transformedStatement.type === BLOCK)
        return transformedStatement;
    }
    return super(tree);
  }

  transformFunctionBody(tree) {
    if (tree.statements.length === 1 &&
        tree.statements[0].type === EXPRESSION_STATEMENT) {
      var transformedStatement =
          this.transformExpressionStatement(tree.statements[0]);
      if (transformedStatement === tree.statements[0])
        return tree;
      if (transformedStatement.type === BLOCK)
        return createFunctionBody(transformedStatement.statements);
    }
    return super(tree);
  }

  transformMemberExpression(tree) {
    var value = this.getValue_(tree.memberName.value);
    if (value === NOT_FOUND)
      return super(tree);
    var operand = this.transformAny(tree.operand);
    return createMemberExpression(operand, value);
  }

  transformLiteralPropertyName(tree) {
    if (tree.literalToken.type === IDENTIFIER) {
      var value = this.getValue_(tree.literalToken.value);
      if (value !== NOT_FOUND) {
        return new LiteralPropertyName(null,
            convertValueToIdentifierToken(value));
      }
    }
    return super(tree);
  }

  transformArgumentList(tree) {
    if (tree.args.length === 1 &&
        tree.args[0].type === IDENTIFIER_EXPRESSION) {
      var arg0 = this.transformAny(tree.args[0]);
      if (arg0 === tree.args[0])
        return tree;
      if (arg0.type === ARGUMENT_LIST)
        return arg0;
    }
    return super(tree);
  }
}

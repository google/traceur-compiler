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

import ParseTreeTransformer from 'ParseTreeTransformer.js';
import ParseTreeType from '../syntax/trees/ParseTree.js';
import PredefinedName from '../syntax/PredefinedName.js';
import TokenType from '../syntax/TokenType.js';
import {
  createBinaryOperator,
  createBlock,
  createConditionalExpression,
  createIdentifierExpression,
  createMemberExpression,
  createMemberLookupExpression,
  createNumberLiteral,
  createOperatorToken,
  createVariableStatement,
  createVoid0
} from 'ParseTreeFactory.js';
import createObject from '../util/util.js';
import trees from '../syntax/trees/ParseTrees.js';

var FormalParameterList = trees.FormalParameterList;
var FunctionDeclaration = trees.FunctionDeclaration;


var stack = [];

/**
 * Desugars default parameters.
 *
 * @see <a href="http://wiki.ecmascript.org/doku.php?id=harmony:parameter_default_values">harmony:parameter_default_values</a>
 * @constructor
 * @extends {ParseTreeTransformer}
 */
export function DefaultParametersTransformer() {
  ParseTreeTransformer.call(this);
}

/**
 * @param {ParseTree} tree
 * @return {ParseTree}
 */
DefaultParametersTransformer.transformTree = function(tree) {
  return new DefaultParametersTransformer().transformAny(tree);
};

DefaultParametersTransformer.prototype = createObject(
    ParseTreeTransformer.prototype, {

  transformFunctionDeclaration: function(tree) {
    stack.push([]);

    var transformedTree = ParseTreeTransformer.prototype.
        transformFunctionDeclaration.call(this, tree);

    var statements = stack.pop();
    if (!statements.length)
      return transformedTree;

    // Prepend the var statements to the block.
    statements.push.apply(statements,
                          transformedTree.functionBody.statements);

    return new FunctionDeclaration(transformedTree.location,
                                   transformedTree.name,
                                   transformedTree.isGenerator,
                                   transformedTree.formalParameterList,
                                   createBlock(statements));
  },

  transformFormalParameterList: function(tree) {
    var parameters = [];
    var statements = stack[stack.length - 1];
    var changed = false;
    var defaultToUndefined = false;
    for (var i = 0; i < tree.parameters.length; i++) {
      var param = this.transformAny(tree.parameters[i]);
      if (param !== tree.parameters[i])
        changed = true;

      if (param.type === ParseTreeType.REST_PARAMETER ||
          !param.initializer && !defaultToUndefined) {
        parameters.push(param);

      // binding = initializer
      // binding  // with default undefined initializer
      //
      // =>
      //
      // var binding = arguments[i] !== (void 0) ? arguments[i] : initializer;
      } else {
        defaultToUndefined = true;
        changed = true;
        statements.push(createVariableStatement(
            TokenType.VAR,
            param.binding,
            createConditionalExpression(
                createBinaryOperator(
                    createMemberLookupExpression(
                        createIdentifierExpression(PredefinedName.ARGUMENTS),
                        createNumberLiteral(i)),
                    createOperatorToken(TokenType.NOT_EQUAL_EQUAL),
                    createVoid0()),
                createMemberLookupExpression(
                    createIdentifierExpression(PredefinedName.ARGUMENTS),
                    createNumberLiteral(i)),
                param.initializer || createVoid0())));
      }
    }

    if (!changed)
      return tree;

    return new FormalParameterList(tree.location, parameters);
  }
});

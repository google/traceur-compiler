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
import PredefinedName from '../syntax/PredefinedName.js';
import TokenType from '../syntax/TokenType.js';
import {
  createArgumentList,
  createBlock,
  createCallExpression,
  createFunctionDeclaration,
  createIdentifierExpression,
  createMemberExpression,
  createNumberLiteral,
  createVariableStatement
} from 'ParseTreeFactory.js';
import createObject from '../util/util.js';
import trees from '../syntax/trees/ParseTrees.js';

var FormalParameterList = trees.FormalParameterList;

/**
 * Desugars rest parameters.
 *
 * @see <a href="http://wiki.ecmascript.org/doku.php?id=harmony:rest_parameters">harmony:rest_parameters</a>
 * @constructor
 * @extends {ParseTreeTransformer}
 */
export function RestParameterTransformer() {
  ParseTreeTransformer.call(this);
}

RestParameterTransformer.transformTree = function(tree) {
  return new RestParameterTransformer().transformAny(tree);
};

function hasRestParameter(formalParameterList) {
  var parameters = formalParameterList.parameters;
  return parameters.length > 0 &&
      parameters[parameters.length - 1].isRestParameter();
}

function getRestParameterName(formalParameterList) {
  var parameters = formalParameterList.parameters;
  return parameters[parameters.length - 1].identifier.identifierToken.value;
}

RestParameterTransformer.prototype = createObject(
    ParseTreeTransformer.prototype, {

  transformFunctionDeclaration: function(tree) {
    if (hasRestParameter(tree.formalParameterList)) {
      return this.desugarRestParameters_(tree);
    } else {
      return ParseTreeTransformer.prototype.transformFunctionDeclaration.
          call(this, tree);
    }
  },

  /**
   * @param {FunctionDeclaration} tree
   * @private
   * @return {ParseTree}
   */
  desugarRestParameters_: function(tree) {

    // Desugar rest parameters as follows:
    //
    // function f(x, ...y) {}
    //
    // function f(x) {
    //   var y = Array.prototype.slice.call(arguments, 1);
    // }

    var parametersWithoutRestParam =
        new FormalParameterList(
            tree.formalParameterList.location,
            tree.formalParameterList.parameters.slice(
                0,
                tree.formalParameterList.parameters.length - 1));

    var sliceExpression = createCallExpression(
        createMemberExpression(PredefinedName.ARRAY, PredefinedName.PROTOTYPE,
                               'slice', PredefinedName.CALL),
        createArgumentList(
            createIdentifierExpression(PredefinedName.ARGUMENTS),
            createNumberLiteral(
                tree.formalParameterList.parameters.length - 1)));

    var variable = createVariableStatement(
        TokenType.VAR,
        getRestParameterName(tree.formalParameterList),
        sliceExpression);

    var statements = [];
    statements.push(variable);
    statements.push.apply(statements, tree.functionBody.statements);

    return createFunctionDeclaration(
        tree.name, parametersWithoutRestParam,
        this.transformAny(createBlock(statements)));
  }
});

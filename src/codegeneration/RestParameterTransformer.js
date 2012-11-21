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
  FormalParameterList
} from '../syntax/trees/ParseTrees.js';
import ParseTreeTransformer from 'ParseTreeTransformer.js';
import {
  ARGUMENTS,
  ARRAY,
  CALL,
  PROTOTYPE
} from '../syntax/PredefinedName.js';
import TokenType from '../syntax/TokenType.js';
import {
  createArgumentList,
  createBlock,
  createCallExpression,
  createIdentifierExpression,
  createMemberExpression,
  createNumberLiteral,
  createVariableStatement
} from 'ParseTreeFactory.js';
import prependStatements from 'PrependStatements.js';

function hasRestParameter(formalParameterList) {
  var parameters = formalParameterList.parameters;
  return parameters.length > 0 &&
      parameters[parameters.length - 1].isRestParameter();
}

function getRestParameterName(formalParameterList) {
  var parameters = formalParameterList.parameters;
  return parameters[parameters.length - 1].identifier.identifierToken.value;
}


/**
 * Desugars rest parameters.
 *
 * @see <a href="http://wiki.ecmascript.org/doku.php?id=harmony:rest_parameters">harmony:rest_parameters</a>
 */
export class RestParameterTransformer extends ParseTreeTransformer {

  transformFunction(tree) {
    if (hasRestParameter(tree.formalParameterList))
      return this.desugarRestParameters_(tree);
    return super.transformFunction(tree);
  }

  /**
   * @param {FunctionDeclaration} tree
   * @private
   * @return {ParseTree}
   */
  desugarRestParameters_(tree) {

    // Desugar rest parameters as follows:
    //
    // function f(x, ...y) {}
    //
    // function f(x) {
    //   var y = Array.prototype.slice.call(arguments, 1);
    // }

    var formalParameterList = this.transformAny(tree.formalParameterList);

    var parametersWithoutRestParam =
        new FormalParameterList(
            formalParameterList.location,
            formalParameterList.parameters.slice(0, -1));

    var sliceExpression = createCallExpression(
        createMemberExpression(ARRAY, PROTOTYPE, 'slice', CALL),
        createArgumentList(
            createIdentifierExpression(ARGUMENTS),
            createNumberLiteral(
                tree.formalParameterList.parameters.length - 1)));

    var variable = createVariableStatement(
        TokenType.VAR,
        getRestParameterName(tree.formalParameterList),
        sliceExpression);

    var statements = prependStatements(tree.functionBody.statements, variable);
    var functionBody = this.transformAny(createBlock(statements));

    return new tree.constructor(tree.location, tree.name, tree.isGenerator,
                                parametersWithoutRestParam, functionBody);
  }
}

RestParameterTransformer.transformTree = function(tree) {
  return new RestParameterTransformer().transformAny(tree);
};

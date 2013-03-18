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
  FormalParameterList
} from '../syntax/trees/ParseTrees.js';
import {TempVarTransformer} from './TempVarTransformer.js';
import {
  createBlock,
  createIdentifierToken,
} from './ParseTreeFactory.js';
import {parseStatement} from './PlaceholderParser.js';
import {prependStatements} from './PrependStatements.js';

function hasRestParameter(formalParameterList) {
  var parameters = formalParameterList.parameters;
  return parameters.length > 0 &&
      parameters[parameters.length - 1].isRestParameter();
}

function getRestParameterLiteralToken(formalParameterList) {
  var parameters = formalParameterList.parameters;
  return parameters[parameters.length - 1].identifier.identifierToken;
}

/**
 * Desugars rest parameters.
 *
 * @see <a href="http://wiki.ecmascript.org/doku.php?id=harmony:rest_parameters">harmony:rest_parameters</a>
 */
export class RestParameterTransformer extends TempVarTransformer {

  transformFunctionDeclaration(tree) {
    if (hasRestParameter(tree.formalParameterList))
      return this.desugarRestParameters_(tree);
    return super.transformFunctionDeclaration(tree);
  }

  transformFunctionExpression(tree) {
    if (hasRestParameter(tree.formalParameterList))
      return this.desugarRestParameters_(tree);
    return super.transformFunctionExpression(tree);
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
    //   for (var y = ...) ...
    // }

    var formalParameterList = this.transformAny(tree.formalParameterList);

    var parametersWithoutRestParam =
        new FormalParameterList(
            formalParameterList.location,
            formalParameterList.parameters.slice(0, -1));

    var startIndex = tree.formalParameterList.parameters.length - 1;
    var i = createIdentifierToken(this.getTempIdentifier());
    var name = getRestParameterLiteralToken(tree.formalParameterList);
    var loop;
    if (startIndex) {
      // If startIndex is 0 we can generate slightly cleaner code.
      loop = parseStatement `
          for (var ${name} = [], ${i} = ${startIndex};
               ${i} < arguments.length; ${i}++)
            ${name}[${i} - ${startIndex}] = arguments[${i}];`;
    } else {
      loop = parseStatement `
          for (var ${name} = [], ${i} = 0;
               ${i} < arguments.length; ${i}++)
            ${name}[${i}] = arguments[${i}];`;
    }

    var statements = prependStatements(tree.functionBody.statements, loop);
    var functionBody = this.transformAny(createBlock(statements));

    return new tree.constructor(tree.location, tree.name, tree.isGenerator,
                                parametersWithoutRestParam, functionBody);
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ParseTree} tree
   */
  static transformTree(identifierGenerator, tree) {
    return new RestParameterTransformer(identifierGenerator).transformAny(tree);
  }
}

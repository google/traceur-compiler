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
  isUndefined,
  isVoidExpression
} from '../semantics/util';
import {FormalParameterList} from '../syntax/trees/ParseTrees';
import {ParameterTransformer} from './ParameterTransformer';
import {ARGUMENTS} from '../syntax/PredefinedName';
import {
  FORMAL_PARAMETER,
  REST_PARAMETER
} from '../syntax/trees/ParseTreeType';
import {
  NOT_EQUAL_EQUAL,
  VAR
} from '../syntax/TokenType';
import {
  createBinaryOperator,
  createConditionalExpression,
  createIdentifierExpression,
  createMemberLookupExpression,
  createNumberLiteral,
  createOperatorToken,
  createVariableStatement,
  createVoid0
} from './ParseTreeFactory';
import {prependStatements} from './PrependStatements';

function createDefaultAssignment(index, binding, initialiser) {
  var argumentsExpression =
      createMemberLookupExpression(
          createIdentifierExpression(ARGUMENTS),
          createNumberLiteral(index));

  var assignmentExpression;
  // If the default value is undefined we can skip testing if arguments[i] is
  // undefined.
  if (initialiser === null || isUndefined(initialiser) ||
      isVoidExpression(initialiser)) {
    // var binding = arguments[i];
    assignmentExpression = argumentsExpression;
  } else {
    // var binding = arguments[i] !== (void 0) ? arguments[i] : initialiser;
    assignmentExpression =
        createConditionalExpression(
            createBinaryOperator(
                argumentsExpression,
                createOperatorToken(NOT_EQUAL_EQUAL),
                createVoid0()),
            argumentsExpression,
            initialiser);
  }
  return createVariableStatement(VAR, binding, assignmentExpression);
}

/**
 * Desugars default parameters.
 *
 * @see <a href="http://wiki.ecmascript.org/doku.php?id=harmony:parameter_default_values">harmony:parameter_default_values</a>
 */
export class DefaultParametersTransformer extends ParameterTransformer {

  transformFormalParameterList(tree) {
    var parameters = [];
    var changed = false;
    var defaultToUndefined = false;
    for (var i = 0; i < tree.parameters.length; i++) {
      var param = this.transformAny(tree.parameters[i]);
      if (param !== tree.parameters[i])
        changed = true;

      if (param.isRestParameter() ||
          !param.parameter.initialiser && !defaultToUndefined) {
        parameters.push(param);

      // binding = initialiser
      // binding  // with default undefined initialiser
      //
      // =>
      //
      // var binding = ...
      } else {
        defaultToUndefined = true;
        changed = true;
        this.parameterStatements.push(
            createDefaultAssignment(i, param.parameter.binding, param.parameter.initialiser));
      }
    }

    if (!changed)
      return tree;

    return new FormalParameterList(tree.location, parameters);
  }
}

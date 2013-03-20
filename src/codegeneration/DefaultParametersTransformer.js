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
  isVoidExpression,
  isLiteralExpression
} from '../semantics/util.js';
import {
  FormalParameterList,
  FunctionDeclaration,
  FunctionExpression
} from '../syntax/trees/ParseTrees.js';
import {ParseTreeTransformer} from './ParseTreeTransformer.js';
import {
  ARGUMENTS,
  UNDEFINED
} from '../syntax/PredefinedName.js';
import {
  IDENTIFIER_EXPRESSION,
  LITERAL_EXPRESSION,
  PAREN_EXPRESSION,
  REST_PARAMETER,
  UNARY_EXPRESSION
} from '../syntax/trees/ParseTreeType.js';
import {
  NOT_EQUAL_EQUAL,
  VAR,
  VOID
} from '../syntax/TokenType.js';
import {
  createBinaryOperator,
  createBlock,
  createConditionalExpression,
  createIdentifierExpression,
  createMemberLookupExpression,
  createNumberLiteral,
  createOperatorToken,
  createVariableStatement,
  createVoid0
} from './ParseTreeFactory.js';
import {prependStatements} from './PrependStatements.js';

var stack = [];

function createDefaultAssignment(index, binding, initializer) {
  var argumentsExpression =
      createMemberLookupExpression(
          createIdentifierExpression(ARGUMENTS),
          createNumberLiteral(index));

  var assignmentExpression;
  // If the default value is undefined we can skip testing if arguments[i] is
  // undefined.
  if (initializer === null || isUndefined(initializer) ||
      isVoidExpression(initializer)) {
    // var binding = arguments[i];
    assignmentExpression = argumentsExpression;
  } else {
    // var binding = arguments[i] !== (void 0) ? arguments[i] : initializer;
    assignmentExpression =
        createConditionalExpression(
            createBinaryOperator(
                argumentsExpression,
                createOperatorToken(NOT_EQUAL_EQUAL),
                createVoid0()),
            argumentsExpression,
            initializer);
  }
  return createVariableStatement(VAR, binding, assignmentExpression);
}

/**
 * Desugars default parameters.
 *
 * @see <a href="http://wiki.ecmascript.org/doku.php?id=harmony:parameter_default_values">harmony:parameter_default_values</a>
 */
export class DefaultParametersTransformer extends ParseTreeTransformer {

  transformFunctionExpression(tree) {
    return this.transformFunction_(tree, FunctionExpression);
  }

  transformFunctionDeclaration(tree) {
    return this.transformFunction_(tree, FunctionDeclaration);
  }

  transformFunction_(tree, constructor) {
    stack.push([]);

    var transformedTree = constructor === FunctionExpression ?
        super.transformFunctionExpression(tree) :
        super.transformFunctionDeclaration(tree);

    var statements = stack.pop();
    if (!statements.length)
      return transformedTree;

    // Prepend the var statements to the block.
    statements = prependStatements(transformedTree.functionBody.statements,
                                   ...statements);

    return new constructor(transformedTree.location,
                           transformedTree.name,
                           transformedTree.isGenerator,
                           transformedTree.formalParameterList,
                           createBlock(statements));
  }

  transformFormalParameterList(tree) {
    var parameters = [];
    var statements = stack[stack.length - 1];
    var changed = false;
    var defaultToUndefined = false;
    for (var i = 0; i < tree.parameters.length; i++) {
      var param = this.transformAny(tree.parameters[i]);
      if (param !== tree.parameters[i])
        changed = true;

      if (param.type === REST_PARAMETER ||
          !param.initializer && !defaultToUndefined) {
        parameters.push(param);

      // binding = initializer
      // binding  // with default undefined initializer
      //
      // =>
      //
      // var binding = ...
      } else {
        defaultToUndefined = true;
        changed = true;
        statements.push(
            createDefaultAssignment(i, param.binding, param.initializer));
      }
    }

    if (!changed)
      return tree;

    return new FormalParameterList(tree.location, parameters);
  }

  /**
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  static transformTree(tree) {
    return new DefaultParametersTransformer().transformAny(tree);
  }
}

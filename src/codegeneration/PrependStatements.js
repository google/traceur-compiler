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
  EXPRESSION_STATEMENT,
  LITERAL_EXPRESSION
} from '../syntax/trees/ParseTreeType';
import {STRING} from '../syntax/TokenType';

function isStringExpressionStatement(tree) {
  return tree.type === EXPRESSION_STATEMENT &&
      tree.expression.type === LITERAL_EXPRESSION &&
      tree.expression.literalToken.type === STRING;
}

/**
 * Prepends |statements| with the |statementsToPrepend| making sure that any
 * leading directives, like 'use strict', are kept at the top of the statements.
 * @param {Array.<ParseTree>} statements
 * @param {ParseTree} statementsToPrepend
 * @return {Array.<ParseTree>}
 */
export function prependStatements(statements, ...statementsToPrepend) {
  if (!statements.length)
    return statementsToPrepend;

  if (!statementsToPrepend.length)
    return statements;

  var transformed  = [];
  var inProlog = true;
  statements.forEach((statement) => {
    if (inProlog && !isStringExpressionStatement(statement)) {
      transformed.push(...statementsToPrepend);
      inProlog = false;
    }
    transformed.push(statement);
  });
  return transformed;
}

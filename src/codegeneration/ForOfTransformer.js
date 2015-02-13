// Copyright 2012 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strong';

import {
  FOR_OF_STATEMENT,
  VARIABLE_DECLARATION_LIST,
  LABELLED_STATEMENT
} from '../syntax/trees/ParseTreeType.js';
import {TempVarTransformer} from './TempVarTransformer.js';
import {
  createIdentifierExpression as id,
  createMemberExpression,
  createVariableStatement
} from './ParseTreeFactory.js';
import {
  parseStatement,
  parseStatements
} from './PlaceholderParser.js';
import {
  AnonBlock,
  LabelledStatement
} from '../syntax/trees/ParseTrees.js';

/**
 * Desugars for-of statement.
 */
export class ForOfTransformer extends TempVarTransformer {
  /**
   * @param {ForOfStatement} original
   * @param {Array.<LabelledStatement>=} labelSet
   * @return {ParseTree}
   */
  transformForOfStatement(original) {
    return this.transformForOfStatement_(original, []);
  }

  transformForOfStatement_(original, labelSet) {
    var tree = super.transformForOfStatement(original);
    var iter = id(this.getTempIdentifier());
    var result = id(this.getTempIdentifier());
    var label = id(this.getTempIdentifier());
    var normalCompletion = id(this.getTempIdentifier());
    var throwCompletion = id(this.getTempIdentifier());
    var exception = id(this.getTempIdentifier());
    var ex = id(this.getTempIdentifier());
    var labelledStatement;
    var innerStatement;

    var assignment;
    if (tree.initializer.type === VARIABLE_DECLARATION_LIST) {
      // {var,let} initializer = $result.value;
      assignment = createVariableStatement(
          tree.initializer.declarationType,
          tree.initializer.declarations[0].lvalue,
          createMemberExpression(result, 'value'));
    } else {
      assignment = parseStatement `${tree.initializer} = ${result}.value;`;
    }

    innerStatement = parseStatement `
        for (var ${result},
                 ${iter} = ${tree.collection}[
                     $traceurRuntime.toProperty(Symbol.iterator)]();
             !(${normalCompletion} = (${result} = ${iter}.next()).done);
             ${normalCompletion} = true) {
          ${assignment}
          ${tree.body}
        }`;
  
    while (labelledStatement = labelSet.pop()) {
      innerStatement = new LabelledStatement(labelledStatement.location,
          labelledStatement.name, innerStatement);
    }

    return new AnonBlock(null, parseStatements `
        var ${normalCompletion} = true;
        var ${throwCompletion} = false;
        var ${exception} = undefined;
        try {
          ${innerStatement}
        } catch (${ex}) {
          ${throwCompletion} = true;
          ${exception} = ${ex};
        } finally {
          try {
            if (!${normalCompletion} && ${iter}.return != null) {
              ${iter}.return();
            }
          } finally {
            if (${throwCompletion}) {
              throw ${exception};
            }
          }
        }`);
  }

  transformLabelledStatement(tree) {
    var labelSet = [tree];
    var statement = tree.statement;
    while (statement.type === LABELLED_STATEMENT) {
      labelSet.push(statement);
      statement = statement.statement;
    }
    if (statement.type !== FOR_OF_STATEMENT) {
      return super.transformLabelledStatement(tree);
      // Slightly inefficient in the (unlikely) case of more than one label
    }
    return this.transformForOfStatement_(statement, labelSet);
  }
}

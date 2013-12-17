// Copyright 2013 Traceur Authors.
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

import {FindInFunctionScope} from './FindInFunctionScope';
import {ModuleTransformer} from './ModuleTransformer';
import {RETURN_STATEMENT} from '../syntax/trees/ParseTreeType';
import {assert} from '../util/assert';
import {
  parseExpression,
  parseStatement,
  parseStatements
} from './PlaceholderParser';

class FindThis extends FindInFunctionScope {
  visitThisExpression(tree) {
    this.found = true;
  }
}

function containsThis(tree) {
  var visitor = new FindThis(tree);
  return visitor.found;
}

export class CommonJsModuleTransformer extends ModuleTransformer {

  wrapModule(statements) {
    var needsIife = statements.some(containsThis);

    if (needsIife) {
      return parseStatements
          `module.exports = function() {
            ${statements}
          }.call(typeof global !== 'undefined' ? global : this);`;
    }

    var last = statements[statements.length - 1];
    statements = statements.slice(0, -1);
    assert(last.type === RETURN_STATEMENT);
    var exportObject = last.expression;
    statements.push(parseStatement `module.exports = ${exportObject};`);
    return statements;
  }

  transformModuleSpecifier(tree) {
    return parseExpression `require(${tree.token})`;
  }
}

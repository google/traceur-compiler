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

import {BIND} from '../syntax/PredefinedName.js';
import {FindInFunctionScope} from './FindInFunctionScope.js';
import {
  FormalParameterList
} from '../syntax/trees/ParseTrees.js';
import {ParseTreeTransformer} from './ParseTreeTransformer.js';
import {FUNCTION_BODY} from '../syntax/trees/ParseTreeType.js';
import {
  createArgumentList,
  createCallExpression,
  createFunctionBody,
  createFunctionExpression,
  createMemberExpression,
  createParenExpression,
  createReturnStatement,
  createThisExpression
} from './ParseTreeFactory.js';

/**
 * This is used to find whether a function contains a reference to 'this'.
 */
class ThisFinder extends FindInFunctionScope {
  visitThisExpression(tree) {
    this.found = true;
  }
}

/**
 * Desugars arrow function expressions
 *
 * @see <a href="http://wiki.ecmascript.org/doku.php?id=strawman:arrow_function_syntax">strawman:arrow_function_syntax</a>
 */
export class ArrowFunctionTransformer extends ParseTreeTransformer {
  /**
   * @param {ErrorReporter} reporter
   */
  constructor(reporter) {
    super();
    this.reporter_ = reporter;
  }

  /**
   * Transforms an arrow function expression into a function declaration.
   * The main things we need to deal with are the 'this' binding, and adding a
   * function body and return statement if needed.
   */
  transformArrowFunctionExpression(tree) {
    var parameters;
    if (tree.formalParameters) {
      parameters = this.transformAny(tree.formalParameters).parameters;
    } else {
      parameters = [];
    }

    var functionBody = this.transformAny(tree.functionBody);
    if (functionBody.type != FUNCTION_BODY) {
      // { return expr; }
      functionBody = createFunctionBody([createReturnStatement(functionBody)]);
    }

    // function(params) { ... }
    var result = createParenExpression(
        createFunctionExpression(
            new FormalParameterList(null, parameters), functionBody));

    // If we have a reference to 'this' in the body we need to bind this.
    var finder = new ThisFinder(functionBody);
    if (finder.found) {
      // (function(params) { ... }).bind(thisBinding);
      return createCallExpression(
          createMemberExpression(result, BIND),
          createArgumentList(createThisExpression()));
    }

    return result;
  }

  static transformTree(reporter, tree) {
    return new ArrowFunctionTransformer(reporter).transformAny(tree);
  }
}

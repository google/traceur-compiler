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

import FindInFunctionScope from 'FindInFunctionScope.js';
import ParseTreeTransformer from 'ParseTreeTransformer.js';
import ParseTreeType from '../syntax/trees/ParseTree.js';
import PredefinedName from '../syntax/PredefinedName.js';
import {
  createArgumentList,
  createBlock,
  createCallExpression,
  createFunctionExpression,
  createMemberExpression,
  createParenExpression,
  createReturnStatement,
  createThisExpression
} from 'ParseTreeFactory.js';
import createObject from '../util/util.js';
import trees from '../syntax/trees/ParseTrees.js';

var FormalParameterList = trees.FormalParameterList;
var ThisExpression = trees.ThisExpression;


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
   * block and return statement if needed.
   */
  transformArrowFunctionExpression(tree) {
    var parameters;
    if (tree.formalParameters) {
      parameters = this.transformAny(tree.formalParameters).parameters;
    } else {
      parameters = [];
    }

    var functionBody = this.transformAny(tree.functionBody);
    if (functionBody.type != ParseTreeType.BLOCK) {
      // { return expr; }
      functionBody = createBlock(createReturnStatement(functionBody));
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
          createMemberExpression(
              result,
              PredefinedName.BIND),
          createArgumentList(createThisExpression()));
    }

    return result;
  }
}

ArrowFunctionTransformer.transformTree = function(reporter, tree) {
  return new ArrowFunctionTransformer(reporter).transformAny(tree);
};

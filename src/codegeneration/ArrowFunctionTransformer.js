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
import ParseTreeFactory from 'ParseTreeFactory.js';
import ParseTreeTransformer from 'ParseTreeTransformer.js';
import ParseTreeType from '../syntax/trees/ParseTree.js';
import PredefinedName from '../syntax/PredefinedName.js';
import createObject from '../util/util.js';
import trees from '../syntax/trees/ParseTrees.js';

var FormalParameterList = trees.FormalParameterList;
var ThisExpression = trees.ThisExpression;

var createArgumentList = ParseTreeFactory.createArgumentList;
var createBlock = ParseTreeFactory.createBlock;
var createCallExpression = ParseTreeFactory.createCallExpression;
var createFunctionExpression = ParseTreeFactory.createFunctionExpression;
var createMemberExpression = ParseTreeFactory.createMemberExpression;
var createParenExpression = ParseTreeFactory.createParenExpression;
var createReturnStatement = ParseTreeFactory.createReturnStatement;
var createThisExpression = ParseTreeFactory.createThisExpression;

/**
 * This is used to find whether a function contains a reference to 'this'.
 * @extend {FindInFunctionScope}
 * @param {ParseTree} tree The tree to search.
 */
function ThisFinder(tree) {
  FindInFunctionScope.call(this, tree);
}
ThisFinder.prototype = createObject(
    FindInFunctionScope.prototype, {

  visitThisExpression: function(tree) {
    this.found = true;
  }
});

/**
 * Desugars arrow function expressions
 *
 * @see <a href="http://wiki.ecmascript.org/doku.php?id=strawman:arrow_function_syntax">strawman:arrow_function_syntax</a>
 *
 * @param {ErrorReporter} reporter
 * @extends {ParseTreeTransformer}
 * @constructor
 */
export function ArrowFunctionTransformer(reporter) {
  this.reporter_ = reporter;
}

ArrowFunctionTransformer.transformTree = function(reporter, tree) {
  return new ArrowFunctionTransformer(reporter).transformAny(tree);
};

ArrowFunctionTransformer.prototype = createObject(
    ParseTreeTransformer.prototype, {

  /**
   * Transforms an arrow function expression into a function declaration.
   * The main things we need to deal with are the 'this' binding, and adding a
   * block and return statement if needed.
   */
  transformArrowFunctionExpression: function(tree) {
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
});

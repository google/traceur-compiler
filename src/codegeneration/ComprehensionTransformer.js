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
  ARGUMENTS,
  THIS
} from '../syntax/PredefinedName.js';
import {AlphaRenamer} from './AlphaRenamer.js';
import {FindInFunctionScope} from './FindInFunctionScope.js';
import {FunctionExpression} from '../syntax/trees/ParseTrees.js';
import {TempVarTransformer} from './TempVarTransformer.js';
import {
  LET,
  VAR
} from '../syntax/TokenType.js';
import {
  COMPREHENSION_FOR,
  COMPREHENSION_IF
  } from '../syntax/trees/ParseTreeType.js';
import {
  createCallExpression,
  createEmptyParameterList,
  createForOfStatement,
  createFunctionBody,
  createIdentifierExpression,
  createIfStatement,
  createParenExpression,
  createThisExpression,
  createVariableDeclarationList
} from './ParseTreeFactory.js';
import {options} from '../options.js';

/**
 * This is used to find whether a function contains a reference to 'this'.
 */
class ThisFinder extends FindInFunctionScope {
  visitThisExpression(tree) {
    this.found = true;
  }
}

/**
 * This is used to find whether a function contains a reference to
 * 'arguments'.
 */
class ArgumentsFinder extends FindInFunctionScope {
  visitIdentifierExpression(tree) {
    if (tree.identifierToken.value === ARGUMENTS)
      this.found = true;
  }
}

/**
 * Base class for GeneratorComprehensionTransformer and
 * ArrayComprehensionTransformer.
 *
 * See subclasses for details on desugaring.
 */
export class ComprehensionTransformer extends TempVarTransformer {
  /**
   * transformArrayComprehension and transformGeneratorComprehension calls
   * this
   * @param {ArrayComprehension|GeneratorComprehension} tree
   * @param {ParseTree} statement The statement that goes inside the innermost
   *     loop (and if if present).
   * @param {boolean} isGenerator
   * @param {ParseTree=} prefix
   * @param {ParseTree=} suffix
   * @return {ParseTree}
   */
  transformComprehension(tree, statement, isGenerator,
      prefix = undefined, suffix = undefined) {

    // This should really be a let but we don't support let in generators.
    // https://code.google.com/p/traceur-compiler/issues/detail?id=6
    var bindingKind = isGenerator || !options.blockBinding ? VAR : LET;

    var statements = prefix ? [prefix] : [];

    for (var i = tree.comprehensionList.length - 1; i >= 0; i--) {
      var item = tree.comprehensionList[i];
      switch (item.type) {
        case COMPREHENSION_IF:
          var expression = this.transformAny(item.expression);
          statement = createIfStatement(expression, statement);
          break;
        case COMPREHENSION_FOR:
          var left = this.transformAny(item.left);
          var iterator = this.transformAny(item.iterator);
          var initializer = createVariableDeclarationList(bindingKind,
                                                          left, null);
          statement = createForOfStatement(initializer, iterator, statement);
          break;
        default:
          throw new Error('Unreachable.');
      }
    }

    var argumentsFinder = new ArgumentsFinder(statement);
    if (argumentsFinder.found) {
      var tempVar = this.addTempVar(
          createIdentifierExpression(ARGUMENTS));
      statement = AlphaRenamer.rename(statement, ARGUMENTS,
                                      tempVar);
    }

    var thisFinder = new ThisFinder(statement);
    if (thisFinder.found) {
      var tempVar = this.addTempVar(createThisExpression());
      statement = AlphaRenamer.rename(statement, THIS,
                                      tempVar);
    }

    statements.push(statement);
    if (suffix)
      statements.push(suffix);

    var func = new FunctionExpression(null, null, isGenerator,
                                      createEmptyParameterList(),
                                      createFunctionBody(statements));

    return createParenExpression(createCallExpression(func));
  }
}

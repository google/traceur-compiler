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

import {ParseTreeVisitor} from '../syntax/ParseTreeVisitor';
import {VAR} from '../syntax/TokenType';
import {assert} from '../util/assert';

// TODO: Add entry more entry points:
//    for..in statment
//    for statement

/**
 * Gets the identifiers bound in {@code tree}. The tree should be a block
 * statement. This means if {@code tree} is:
 *
 * <pre>
 * { function f(x) { var y; } }
 * </pre>
 *
 * Then only {@code "f"} is bound; {@code "x"} and {@code "y"} are bound in
 * the separate lexical scope of {@code f}. Note that only const/let bound
 * variables (such as {@code "f"} in this example) are returned. Variables
 * declared with "var" are only returned when {@code includeFunctionScope} is
 * set to true.
 *
 * If {@code tree} was instead:
 * <pre>
 * { var z = function f(x) { var y; }; }
 * </pre>
 *
 * Then only {@code "z"} is bound
 *
 * @param {Block} tree
 * @param {boolean=} includeFunctionScope
 * @return {Object}
 */
export function variablesInBlock(tree, includeFunctionScope = false) {
  var binder = new VariableBinder(includeFunctionScope, tree);
  binder.visitAny(tree);
  return binder.identifiers_;
};

/**
 * Gets the identifiers bound in the context of a function,
 * {@code tree}, other than the function name itself. For example, if
 * {@code tree} is:
 *
 * <pre>
 * function f(x) { var y; f(); }
 * </pre>
 *
 * Then a set containing only {@code "x"} and {@code "y"} is returned. Note
 * that we treat {@code "f"} as free in the body of {@code f}, because
 * AlphaRenamer uses this fact to determine if the function name is shadowed
 * by another name in the body of the function.
 *
 * <p>Only identifiers that are bound <em>throughout</em> the
 * specified tree are returned, for example:
 *
 * <pre>
 * function f() {
 *   try {
 *   } catch (x) {
 *     function g(y) { }
 *   }
 * }
 * </pre>
 *
 * Reports nothing as being bound, because {@code "x"} is only bound in the
 * scope of the catch block; {@code "g"} is let bound to the catch block, and
 * {@code "y"} is only bound in the scope of {@code g}.
 *
 * <p>{@code "arguments"} is only reported as bound if it is
 * explicitly bound in the function. If it is not explicitly bound,
 * {@code "arguments"} is implicitly bound during function
 * invocation.
 *
 * @param {FunctionDeclaration} tree
 * @return {Object}
 */
export function variablesInFunction(tree) {
  var binder = new VariableBinder(true, tree.functionBody);
  binder.visitAny(tree.parameterList);
  binder.visitAny(tree.functionBody);
  return binder.identifiers_;
};

/**
 * Finds the identifiers that are bound in a given scope. Identifiers
 * can be bound by function declarations, formal parameter lists,
 * variable declarations, and catch headers.
 */
export class VariableBinder extends ParseTreeVisitor {
  /**
   * @param {boolean} inFunctionScope
   * @param {Block=} scope
   */
  constructor(includeFunctionScope, scope = null) {
    super();

    // Should we include:
    // * all "var" declarations
    // * all block scoped declarations occurring in the top level function
    //   block.
    this.includeFunctionScope_ = includeFunctionScope;

    // Block within which we are looking for declarations:
    // * block scoped declaration occurring in this block.
    // If function != null this refers to the top level function block.
    this.scope_ = scope;

    // Block currently being processed
    this.block_ = null;

    this.identifiers_ = Object.create(null);
  }

  visitBindingIdentifier(tree) {
    this.identifiers_[tree.identifierToken.value] = true;
  }

  /** @param {Block} tree */
  visitBlock(tree) {
    // Save and set current block
    var parentBlock = this.block_;
    this.block_ = tree;

    // visit the statements
    this.visitList(tree.statements);

    // restore current block
    this.block_ = parentBlock;
  }

  visitFunctionDeclaration(tree) {
    // functions follow the binding rules of 'let'
    if (this.block_ === this.scope_)
      this.visitAny(tree.name);
  }

  visitFunctionExpression(tree) {
    // We don't recurse into function bodies, because they create
    // their own lexical scope.
  }

  visitCatch(tree) {
    // Do not include catch binding
    this.visitAny(tree.catchBody);
  }

  visitVariableDeclarationList(tree) {
    if (this.includeFunctionScope_ || tree.declarationType !== VAR)
      super(tree);
  }
}

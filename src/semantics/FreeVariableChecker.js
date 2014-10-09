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

import {
  FUNCTION_DECLARATION,
  FUNCTION_EXPRESSION,
  GET_ACCESSOR,
  IDENTIFIER_EXPRESSION,
  MODULE,
  PROPERTY_METHOD_ASSIGNMENT,
  SET_ACCESSOR
} from '../syntax/trees/ParseTreeType';
import {TYPEOF} from '../syntax/TokenType';
import {ScopeVisitor} from './ScopeVisitor';
import {ScopeChainBuilder} from './ScopeChainBuilder';

function hasArgumentsInScope(scope) {
  for (; scope; scope = scope.parent) {
    switch (scope.tree.type) {
      case FUNCTION_DECLARATION:
      case FUNCTION_EXPRESSION:
      case GET_ACCESSOR:
      case PROPERTY_METHOD_ASSIGNMENT:
      case SET_ACCESSOR:
        return true;
    }
  }
  return false;
}

function inModuleScope(scope) {
  for (; scope; scope = scope.parent) {
    if (scope.tree.type === MODULE) {
      return true;
    }
  }
  return false;
}

/**
 * Checks for free variables and reports an error for each of them.
 */
class FreeVariableChecker extends ScopeVisitor {
  /**
   * @param {ScopeVisitor} scopeBuilder
   * @param {ErrorReporter} reporter
   */
  constructor(scopeBuilder, reporter, global = Object.create(null)) {
    super();
    this.scopeBuilder_ = scopeBuilder;
    this.reporter_ = reporter;
    this.global_ = global;
  }

  pushScope(tree) {
    // Override to return the pre-built scope.
    return this.scope = this.scopeBuilder_.getScopeForTree(tree);
  }

  visitUnaryExpression(tree) {
    // Allow typeof x to be a heuristic for allowing reading x later.
    if (tree.operator.type === TYPEOF &&
        tree.operand.type === IDENTIFIER_EXPRESSION) {
      var scope = this.scope;
      var binding = scope.getBinding(tree.operand);
      if (!binding) {
        scope.addVar(tree.operand, this.reporter_);
      }
    } else {
      super(tree);
    }
  }

  visitIdentifierExpression(tree) {
    if (this.inWithBlock) {
      return;
    }
    var scope = this.scope;
    var binding = scope.getBinding(tree);
    if (binding) {
      return;
    }

    var name = tree.getStringValue();
    if (name === 'arguments' && hasArgumentsInScope(scope)) {
      return;
    }

    if (name === '__moduleName' && inModuleScope(scope)) {
      return;
    }

    if (!(name in this.global_)) {
      this.reporter_.reportError(tree.location.start,
                                 `${name} is not defined`);
    }
  }
}

/**
 * Validates that there are no free variables in a tree.
 */
export function validate(tree, reporter, global = Reflect.global) {
  var builder = new ScopeChainBuilder(reporter);
  builder.visitAny(tree);
  var checker = new FreeVariableChecker(builder, reporter, global);
  checker.visitAny(tree);
}

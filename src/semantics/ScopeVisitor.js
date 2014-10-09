// Copyright 2014 Traceur Authors.
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

import {Map} from '../runtime/polyfills/Map';
import {ParseTreeVisitor} from '../syntax/ParseTreeVisitor';
import {VAR} from '../syntax/TokenType';
import {Scope} from './Scope';
import {
  COMPREHENSION_FOR,
  VARIABLE_DECLARATION_LIST
} from '../syntax/trees/ParseTreeType';

/**
 * Base class for building up the scope chains for a tree.
 */
export class ScopeVisitor extends ParseTreeVisitor {
  constructor() {
    this.map_ = new Map();
    this.scope = null;
    this.withBlockCounter_ = 0;
  }

  getScopeForTree(tree) {
    return this.map_.get(tree);
  }

  /**
   * @return {Scope}
   */
  pushScope(tree) {
    var scope = new Scope(this.scope, tree);
    this.map_.set(tree, scope);
    return this.scope = scope;
  }

  /**
   * @param {Scope} scope
   */
  popScope(scope) {
    if (this.scope !== scope) {
      throw new Error('ScopeVisitor scope mismatch');
    }

    this.scope = scope.parent;
  }

  visitScript(tree) {
    var scope = this.pushScope(tree);
    super(tree);
    this.popScope(scope);
  }

  visitModule(tree) {
    var scope = this.pushScope(tree);
    super(tree);
    this.popScope(scope);
  }

  visitBlock(tree) {
    var scope = this.pushScope(tree);
    super(tree);
    this.popScope(scope);
  }

  visitCatch(tree) {
    var scope = this.pushScope(tree);
    this.visitAny(tree.binding);
    // We already entered the block.
    this.visitList(tree.catchBody.statements);
    this.popScope(scope);
  }

  visitFunctionBodyForScope(tree, parameterList = tree.parameterList) {
    var scope = this.pushScope(tree);
    this.visitAny(parameterList);
    this.visitAny(tree.body);
    this.popScope(scope);
  }

  visitFunctionExpression(tree) {
    this.visitFunctionBodyForScope(tree);
  }

  visitFunctionDeclaration(tree) {
    this.visitAny(tree.name);
    this.visitFunctionBodyForScope(tree);
  }

  visitArrowFunctionExpression(tree) {
    this.visitFunctionBodyForScope(tree);
  }

  visitGetAccessor(tree) {
    this.visitFunctionBodyForScope(tree, null);
  }

  visitSetAccessor(tree) {
    this.visitFunctionBodyForScope(tree);
  }

  visitPropertyMethodAssignment(tree) {
    this.visitFunctionBodyForScope(tree);
  }

  visitClassDeclaration(tree) {
    this.visitAny(tree.superClass);
    var scope = this.pushScope(tree);
    this.visitAny(tree.name);
    this.visitList(tree.elements);
    this.popScope(scope);
  }

  visitClassExpression(tree) {
    this.visitAny(tree.superClass);
    var scope;
    if (tree.name) {
      scope = this.pushScope(tree);
      this.visitAny(tree.name);
    }
    this.visitList(tree.elements);
    if (tree.name) {
      this.popScope(scope);
    }
  }

  visitWithStatement(tree) {
    this.visitAny(tree.expression);
    this.withBlockCounter_++;
    this.visitAny(tree.body);
    this.withBlockCounter_--;
  }

  get inWithBlock() {
    return this.withBlockCounter_ > 0;
  }

  visitLoop_(tree, func) {
    if (tree.initializer.type !== VARIABLE_DECLARATION_LIST ||
        tree.initializer.declarationType === VAR) {
      func();
      return;
    }

    var scope = this.pushScope(tree);
    func();
    this.popScope(scope);
  }

  visitForInStatement(tree) {
    this.visitLoop_(tree, () => super(tree));
  }

  visitForOfStatement(tree) {
    this.visitLoop_(tree, () => super(tree));
  }

  visitForStatement(tree) {
    if (!tree.initializer) {
      super(tree);
    } else {
      this.visitLoop_(tree, () => super(tree));
    }
  }

  visitComprehension_(tree) {
    var scopes = [];
    for (var i = 0; i < tree.comprehensionList.length; i++) {
      var scope = null;
      if (tree.comprehensionList[i].type === COMPREHENSION_FOR) {
        scope = this.pushScope(tree.comprehensionList[i]);
      }
      scopes.push(scope);
      this.visitAny(tree.comprehensionList[i]);
    }

    this.visitAny(tree.expression);

    for(var i = scopes.length - 1; i >= 0; i--) {
      if (scopes[i]) {
        this.popScope(scopes[i]);
      }
    }
  }

  visitArrayComprehension(tree) {
    this.visitComprehension_(tree);
  }

  visitGeneratorComprehension(tree) {
    this.visitComprehension_(tree);
  }
}

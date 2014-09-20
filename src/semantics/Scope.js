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

import {
  BLOCK,
  CATCH
} from '../syntax/trees/ParseTreeType';
import {VAR} from '../syntax/TokenType';
import {isTreeStrict} from './isTreeStrict';

function reportDuplicateVar(reporter, tree, name) {
  reporter.reportError(tree.location && tree.location.start,
      `Duplicate declaration, ${name}`);
}

/**
 * Represents the link in the scope chain.
 */
export class Scope {
  /**
   * @param {Scope} parent The parent scope, or null if top level scope.
   * @param {ParseTree} tree
   */
  constructor(parent, tree) {
    this.parent = parent;
    this.tree = tree;
    // These are the variable declarations introduced in this scope. These are
    // set here even if the scope represents a block but we also add them to
    // parent scope all the way up until we find a funciton or top level scope.
    this.variableDeclarations = Object.create(null);
    // Let and const as well as block scoped functions.
    this.lexicalDeclarations = Object.create(null);
    this.strictMode = parent && parent.strictMode || isTreeStrict(tree);
  }

  addBinding(tree, type, reporter) {
    if (type === VAR) {
      this.addVar(tree, reporter);
    } else {
      this.addDeclaration(tree, type, reporter);
    }
  }

  addVar(tree, reporter) {
    // We add VAR bindings to blocks so that we can check for duplicates.
    var name = tree.getStringValue();
    if (this.lexicalDeclarations[name]) {
      reportDuplicateVar(reporter, tree, name);
      return;
    }
    this.variableDeclarations[name] = {type: VAR, tree};
    // This may be used starting at a block scope.
    if (!this.isVarScope && this.parent) {
      this.parent.addVar(tree, reporter);
    }
  }

  addDeclaration(tree, type, reporter) {
    var name = tree.getStringValue();
    if (this.lexicalDeclarations[name] || this.variableDeclarations[name]) {
      reportDuplicateVar(reporter, tree, name);
      return;
    }
    this.lexicalDeclarations[name] = {type, tree};
  }

  // we deduce the oldType
  renameBinding(oldName, newTree, newType, reporter) {
    var name = newTree.getStringValue();
    if (newType == VAR) {
      if (this.lexicalDeclarations[oldName]) {
        delete this.lexicalDeclarations[oldName];
        this.addVar(newTree, reporter);
      }
    } else if (this.variableDeclarations[oldName]) {
      delete this.variableDeclarations[oldName];
      this.addDeclaration(newTree, newType, reporter);
      if (!this.isVarScope && this.parent) {
        this.parent.renameBinding(oldName, newTree, newType);
      }
    }
  }

  get isVarScope() {
    switch (this.tree.type) {
      case BLOCK:
      case CATCH:
        return false;
    }
    return true;
  }

  getVarScope() {
    if (this.isVarScope) {
      return this;
    }
    if (this.parent) {
      return this.parent.getVarScope();
    }
    return null;
  }

  getBinding(tree) {
    var name = tree.getStringValue();
    return this.getBindingByName(name);
  }

  getBindingByName(name) {
    var b = this.lexicalDeclarations[name];
    if (b) {
      return b;
    }

    b = this.variableDeclarations[name];
    if (b && this.isVarScope) {
      return b;
    }
    if (this.parent) {
      return this.parent.getBindingByName(name);
    }
    return null;
  }

  getAllBindingNames() {
    var names = Object.create(null);
    var name;
    for (name in this.variableDeclarations) {
      names[name] = true;
    }
    for (name in this.lexicalDeclarations) {
      names[name] = true;
    }
    return names;
  }

  getVariableBindingNames() {
    var names = Object.create(null);
    for (var name in this.variableDeclarations) {
      names[name] = true;
    }
    return names;
  }

  getLexicalBindingNames() {
    var names = Object.create(null);
    for (var name in this.lexicalDeclarations) {
      names[name] = true;
    }
    return names;
  }

  hasBindingName(name) {
    return this.lexicalDeclarations[name] || this.variableDeclarations[name];
  }

  hasLexicalBindingName(name) {
    return this.lexicalDeclarations[name];
  }

  hasVariableBindingName(name) {
    return this.variableDeclarations[name];
  }
}

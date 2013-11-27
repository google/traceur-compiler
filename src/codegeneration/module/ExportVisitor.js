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

import {ExportSymbol} from '../../semantics/symbols/ExportSymbol';
import {ModuleVisitor} from './ModuleVisitor';
import {assert} from '../../util/assert';

/**
 * Visits a parse tree and adds all the exports.
 *
 *   export {x, y as z};
 *   export {a, b as c} from 'd'
 *   export class C {}
 *   export var v = 1;
 *   export default 42;
 *   ...
 *
 * This does not follow export *.
 */
export class ExportVisitor extends ModuleVisitor {
  constructor(reporter = undefined, project = undefined, module = undefined) {
    super(reporter, project, module);
    this.inExport_ = false;
    this.moduleSpecifier = null;
    this.namedExports = [];
    this.starExports = [];
  }

  addExport_(name, tree) {
    assert(typeof name == 'string');
    if (this.inExport_)
      this.addExport(name, tree);
  }

  addExport(name, tree) {
    this.namedExports.push({name, tree, moduleSpecifier: this.moduleSpecifier});
  }

  visitClassDeclaration(tree) {
    this.addExport_(tree.name.identifierToken.value, tree);
  }

  visitExportDeclaration(tree) {
    this.inExport_ = true;
    this.visitAny(tree.declaration);
    this.inExport_ = false;
  }

  visitNamedExport(tree) {
    this.moduleSpecifier = tree.moduleSpecifier;
    this.visitAny(tree.specifierSet);
    this.moduleSpecifier = null;
  }

  visitExportDefault(tree) {
    this.addExport_('default', tree);
  }

  visitExportSpecifier(tree) {
    this.addExport_((tree.rhs || tree.lhs).value, tree);
  }

  visitExportStar(tree) {
    this.starExports.push(this.moduleSpecifier);
  }

  visitFunctionDeclaration(tree) {
    this.addExport_(tree.name.identifierToken.value, tree);
  }

  visitModuleDeclaration(tree) {
    this.addExport_(tree.identifier.value, tree);
  }

  visitVariableDeclaration(tree) {
    this.addExport_(tree.lvalue.identifierToken.value, tree);
  }
}

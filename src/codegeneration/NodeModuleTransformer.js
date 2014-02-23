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

import {createMemberExpression} from './ParseTreeFactory';
import {ModuleTransformer} from './ModuleTransformer';
import {parseExpression, parseStatement} from './PlaceholderParser';
import {
  ExportDefault,
  Module
} from '../syntax/trees/ParseTrees';
import {ParseTreeVisitor} from '../syntax/ParseTreeVisitor';

/**
 * @fileoverview Convert statically analyzable node modules to es6 modules.
 *    var fs = require('fs');
 * to
 *    import fs from 'fs';
 */


class RequireIdentifierFinder extends ParseTreeVisitor {
  /**
   * @param {ParseTree} tree tree.operand from Call
   */
  findIn(tree) {
    this.found = false;
    this.visitAny(tree);
    return this.found;
  }

  visitIdentifierExpression(tree) {
    if (tree.identifierToken.value === 'require') {
      this.found = true;
    }
  }
}

class SingleArgumentLiteralFinder extends ParseTreeVisitor {
  findIn(tree) {
    this.found = false;
    this.visitAny(tree);
    return this.found;
  }

  visitArgumentList(tree) {
    if (tree.args.length === 1)
      this.visitList(tree.args);
  }

  visitLiteralExpression(tree) {
    this.found = tree.literalToken.processedValue;
  }
}

export class NodeModuleTransformer extends ModuleTransformer {
  constructor() {
    this.requireFinder_ = new RequireIdentifierFinder();
    this.literalFinder_ = new SingleArgumentLiteralFinder();
    super();
  }

  moduleDeclarationStatement() {
    return parseStatement `var module = {};`;
  }

  exportExpression(tree) {
    return new ExportDefault(null, createMemberExpression('module', 'exports'));
  }

  transformModule(tree) {
    var scriptItemList = tree.scriptItemList.slice(0);
    scriptItemList.unshift(this.moduleDeclarationStatement());
    scriptItemList.push(this.exportExpression());
    this.exportVisitor.addExport('default', this.exportExpression());
    tree = new Module(tree.location, scriptItemList, tree.moduleName);
    tree = super(tree);
    return tree;
  }

  transformCallExpression(tree) {
    if (this.requireFinder_.findIn(tree.operand)) {
      var name = this.literalFinder_.findIn(tree.args);
      if (name) {
        // import/module {x} from 'name' is relative to the current file.
        var normalizedName = System.normalize(name, this.moduleName);
        return parseExpression
            `$traceurRuntime.ModuleStore.get(${normalizedName})`;
      }
    }
    // Do not recurse
    return tree;
  }

}

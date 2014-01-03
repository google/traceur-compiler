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

import {ExportVisitor} from '../codegeneration/module/ExportVisitor';
import {ValidationVisitor} from '../codegeneration/module/ValidationVisitor';
import {transformOptions} from '../options';

// TODO(arv): Validate that there are no free variables
// TODO(arv): Validate that the exported reference exists

/**
 * Builds up all module symbols and validates them.
 */
export class ModuleAnalyzer {
  /**
   * @param {ErrorReporter} reporter
   */
  constructor(reporter) {
    this.reporter_ = reporter;
  }

  /**
   * @param {Array.<ParseTree>} trees
   * @param {Array.<ModuleSymbol>=} moduleSymbols
   * @param {Loader} loader
   * @return {void}
   */
  analyzeTrees(trees, moduleSymbols, loader) {
    if (!transformOptions.modules)
      return;

    var reporter = this.reporter_;
    function getModuleSymbol(i) {
      return moduleSymbols.length ? moduleSymbols[i] : moduleSymbols;
    }

    function doVisit(ctor) {
      for (var i = 0; i < trees.length; i++) {
        var visitor = new ctor(reporter, loader, getModuleSymbol(i));
        visitor.visitAny(trees[i]);
      }
    }

    function reverseVisit(ctor) {
      for (var i = trees.length - 1; i >= 0; i--) {
        var visitor = new ctor(reporter, loader, getModuleSymbol(i));
        visitor.visitAny(trees[i]);
      }
    }

    // Export star needs to be done in dependency order.
    reverseVisit(ExportVisitor);
    doVisit(ValidationVisitor);
  }
}

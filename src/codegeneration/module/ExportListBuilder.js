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

import {ExportVisitor} from './ExportVisitor';
import {ValidationVisitor} from './ValidationVisitor';
import {transformOptions} from '../../options';

// TODO(arv): Validate that there are no free variables
// TODO(arv): Validate that the exported reference exists

/**
 * Builds up all module symbols and validates them.
 */
export class ExportListBuilder {
  /**
   * @param {ErrorReporter} reporter
   */
  constructor(reporter) {
    this.reporter_ = reporter;
  }

  /**
   * @param {Array.<Object>} deps, {moduleSymbol, treee}
   * @param {Loader} loader
   * @return {void}
   */
  buildExportList(deps, loader) {
    if (!transformOptions.modules)
      return;

    var reporter = this.reporter_;

    function doVisit(ctor) {
      for (var i = 0; i < deps.length; i++) {
        var visitor = new ctor(reporter, loader, deps[i].moduleSymbol);
        visitor.visitAny(deps[i].tree);
      }
    }

    function reverseVisit(ctor) {
      for (var i = deps.length - 1; i >= 0; i--) {
        var visitor = new ctor(reporter, loader, deps[i].moduleSymbol);
        visitor.visitAny(deps[i].tree);
      }
    }

    // Export star needs to be done in dependency order.
    reverseVisit(ExportVisitor);
    doVisit(ValidationVisitor);
  }
}

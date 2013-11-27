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
import {ExportVisitor} from './ExportVisitor';
import {assert} from '../../util/assert';

/**
 * Visits a parse tree and adds all the export definitions, including export *.
 */
export class ExportValidationVisitor extends ExportVisitor {
  addExport(name, tree) {
    super(name, tree);

    var module = this.currentModule;
    if (module.hasExport(name)) {
      this.reportError_(tree, 'Duplicate export declaration \'%s\'', name);
      this.reportRelatedError_(module.getExport(name));
      return;
    }
    module.addExport(new ExportSymbol(name, tree, this.moduleSpecifier));
  }

  // Override to add exports from the ModuleSpecifier.
  visitExportStar(tree) {
    var module = this.getModuleForModuleSpecifier(this.moduleSpecifier);
    module.getExports().forEach(({name}) => {
      this.addExport(name, tree);
    });
  }

}

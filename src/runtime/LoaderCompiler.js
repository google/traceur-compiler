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

import {
  AttachModuleNameTransformer
} from '../codegeneration/module/AttachModuleNameTransformer';
import {FromOptionsTransformer} from '../codegeneration/FromOptionsTransformer';
import {buildExportList} from '../codegeneration/module/ExportListBuilder';
import {CollectingErrorReporter} from '../util/CollectingErrorReporter';
import {ModuleSpecifierVisitor} from
    '../codegeneration/module/ModuleSpecifierVisitor';
import {ModuleSymbol} from '../codegeneration/module/ModuleSymbol';
import {Parser} from '../syntax/Parser';
import {options as globalOptions} from '../Options';
import {SourceFile} from '../syntax/SourceFile';
import {systemjs} from '../runtime/system-map';
import {toSource} from '../outputgeneration/toSource';
import {UniqueIdentifierGenerator} from
    '../codegeneration/UniqueIdentifierGenerator';
import {isAbsolute, resolveUrl} from '../util/url';

import {assert} from '../util/assert';

// TODO These CodeUnit (aka Load) states are used by code in this file
// that belongs in Loader.
var NOT_STARTED = 0;
var LOADING = 1;
var LOADED = 2;
var PARSED = 3;
var TRANSFORMING = 4
var TRANSFORMED = 5;
var COMPLETE = 6;
var ERROR = 7;

var identifierGenerator = new UniqueIdentifierGenerator();

export class LoaderCompiler {

  getModuleSpecifiers(codeUnit) {
    this.parse(codeUnit);
    codeUnit.state = PARSED;

    // Analyze to find dependencies
    var moduleSpecifierVisitor = new ModuleSpecifierVisitor();
    moduleSpecifierVisitor.visit(codeUnit.metadata.tree);
    return moduleSpecifierVisitor.moduleSpecifiers;
  }

  parse(codeUnit) {
    assert(!codeUnit.metadata.tree);
    var reporter = new CollectingErrorReporter();
    var file = new SourceFile(codeUnit.metadata.sourceName, codeUnit.source);
    // The parser reads from global traceur options.
    globalOptions.setFromObject(codeUnit.metadata.traceurOptions);
    this.checkForErrors((reporter) => {
      var parser = new Parser(file, reporter);
      if (codeUnit.type == 'module')
        codeUnit.metadata.tree = parser.parseModule();
      else
        codeUnit.metadata.tree = parser.parseScript();
    });

    var normalizedName = codeUnit.normalizedName;
  }

  transform(codeUnit) {
    var transformer = new AttachModuleNameTransformer(codeUnit.normalizedName);
    var transformedTree = transformer.transformAny(codeUnit.metadata.tree);

    return this.checkForErrors((reporter) => {
      transformer = new FromOptionsTransformer(reporter,
          identifierGenerator);

      return transformer.transform(transformedTree);
    });
  }

  write(codeUnit) {
    var sourceRoot = codeUnit.metadata.sourceRoot;
    var metadata = codeUnit.metadata;
    var outputName = codeUnit.metadata.outputName || '<loaderOutput>';
    [metadata.transcoded, metadata.sourceMap] =
        toSource(metadata.transformedTree, metadata.traceurOptions, outputName,
            sourceRoot);
  }

  evaluateCodeUnit(codeUnit) {
    // Source for modules compile into calls to registerModule(url, fnc).
    //
    var src = codeUnit.metadata.transcoded + '\n//@ sourceURL=' + codeUnit.address + '\n';
    var result = ('global', eval)(src);
    codeUnit.metadata.transformedTree = null;
    return result;
  }

  analyzeDependencies(dependencies, loader) {
    var deps = [];  // moduleSymbol for each dependency
    for (var i = 0; i < dependencies.length; i++) {
      var codeUnit = dependencies[i];

      // We should not have gotten here if unless all are PARSED
      assert(codeUnit.state >= PARSED);

      if (codeUnit.state == PARSED) {
        var symbol = codeUnit.metadata.moduleSymbol =
            new ModuleSymbol(codeUnit.metadata.tree, codeUnit.normalizedName);
        deps.push(symbol);
      }
    }

    this.checkForErrors((reporter) => buildExportList(deps, loader, reporter));
  }

  checkForErrors(fncOfReporter) {
    var reporter = new CollectingErrorReporter();
    var result = fncOfReporter(reporter);
    if (reporter.hadError())
      throw reporter.toError();
    return result;
  }

}

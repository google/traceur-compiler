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

import {Loader} from '../src/runtime/Loader';
import {
  InterceptOutputLoaderHooks
} from '../src/runtime/InterceptOutputLoaderHooks';
import {ErrorReporter} from '../src/util/ErrorReporter';
import {
  SourceMapGenerator,
  SourceMapConsumer
} from '../src/outputgeneration/SourceMapIntegration';
import {options as traceurOptions} from '../src/options';

class BatchErrorReporter extends ErrorReporter {
  constructor() {
    this.errors = [];
  }
  reportMessageInternal(location, format, args) {
    this.errors.push(ErrorReporter.format(location, format, args));
  }
}

export function transcode(contents, name, onSuccess, onFailure) {
  var options;
  if (traceurOptions.sourceMaps) {
    var config = {file: 'traceured.js'};
    var sourceMapGenerator = new SourceMapGenerator(config);
    options = {sourceMapGenerator: sourceMapGenerator};
  }
  var reporter = new BatchErrorReporter();
  var url = location.href;
  var loaderHooks = new InterceptOutputLoaderHooks(reporter, url, options);

  function reportErrors() {
    onFailure(reporter.errors);
  }
  function reportTranscoding() {
    onSuccess(loaderHooks.transcoded, loaderHooks.sourceMap);
  }
  var loader = new Loader(loaderHooks);
  loader.module(contents, name, {}, reportTranscoding, reportErrors);
}

export function renderSourceMap(source, sourceMap) {
  var consumer = new SourceMapConsumer(sourceMap);
  var lines = source.split('\n');
  var lineNumberTable = lines.map(function(line, lineNo) {
    var generatedPosition = {
      line: lineNo + 1,
      column: 0
    };
    var position = consumer.originalPositionFor(generatedPosition);
    var lineDotColumn = position.line + '.' + position.column;
    return (lineNo + 1) + ': ' + line + ' -> ' + lineDotColumn;
  });
  return 'SourceMap:\n' + lineNumberTable.join('\n');
}

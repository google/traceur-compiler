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

import {Loader} from 'traceur@0.0/src/runtime/Loader';
import {
  InterceptOutputLoaderHooks
} from 'traceur@0.0/src/runtime/InterceptOutputLoaderHooks';
import {ErrorReporter} from 'traceur@0.0/src/util/ErrorReporter';
import {
  SourceMapGenerator,
  SourceMapConsumer
} from 'traceur@0.0/src/outputgeneration/SourceMapIntegration';
import {options as traceurOptions} from 'traceur@0.0/src/options';

class BatchErrorReporter extends ErrorReporter {
  constructor() {
    this.errors = [];
  }
  reportMessageInternal(location, format, args) {
    this.errors.push(ErrorReporter.format(location, format, args));
  }
}

export function transcode(contents, onSuccess, onFailure, onTranscoded) {
  var options;
  if (traceurOptions.sourceMaps) {
    var config = {file: 'traceured.js'};
    var sourceMapGenerator = new SourceMapGenerator(config);
    options = {sourceMapGenerator: sourceMapGenerator};
  }
  var reporter = new BatchErrorReporter();
  var url = location.href;
  var loaderHooks = new InterceptOutputLoaderHooks(reporter, url, options);
  loaderHooks.onTranscoded = onTranscoded;

  function reportErrors() {
    onFailure(reporter.errors);
  }
  var loader = new Loader(loaderHooks);
  loader.module(contents, {}).then(onSuccess, reportErrors);
}

export function renderSourceMap(source, sourceMap) {
  var consumer = new SourceMapConsumer(sourceMap);
  var lines = source.split('\n');
  var lineNumberTable = lines.map(function(line, lineNo) {
    var generatedPosition = {
      line: lineNo + 1,
      column: 0
    };
    var positionBegin = consumer.originalPositionFor(generatedPosition);
    generatedPosition.column = (line.length || 1) - 1;
    var positionEnd = consumer.originalPositionFor(generatedPosition);
    var lineDotColumnBegin = positionBegin.line + '.' + positionBegin.column;
    var lineDotColumnEnd = positionEnd.line + '.' + positionEnd.column;
    return (lineNo + 1) + ': ' + line +
        ' // ' + lineDotColumnBegin + ' - ' + lineDotColumnEnd;
  });
  return 'SourceMap:\n' + lineNumberTable.join('\n');
}

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

import {BrowserTraceurLoader} from 'traceur@0.0/src/loader/TraceurLoader.js';
import {ErrorReporter} from 'traceur@0.0/src/util/ErrorReporter.js';
import {
  SourceMapGenerator,
  SourceMapConsumer
} from 'traceur@0.0/src/outputgeneration/SourceMapIntegration.js';
import {webLoader} from 'traceur@0.0/src/loader/webLoader.js';

class BatchErrorReporter extends ErrorReporter {
  constructor() {
    super();
    this.errors = [];
  }
  reportMessageInternal(location, format, args) {
    this.errors.push(ErrorReporter.format(location, format, args));
  }
}

export function transcode(contents, options, onSuccess, onFailure) {
  var url = location.href;
  var loadOptions = {
    address: 'traceured.js',
    metadata: {
      traceurOptions: options
    }
  };

  var loader = new BrowserTraceurLoader();
  var load = options.script ? loader.script : loader.module;
  load.call(loader, contents, loadOptions).
      then(() => onSuccess(loadOptions.metadata),
          (error) => onFailure(error, loadOptions.metadata));
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

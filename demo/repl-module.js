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

import {ErrorReporter} from 'traceur@0.0/src/util/ErrorReporter.js';
import {
  GeneratedSourceMapMapping,
  OriginalSourceMapMapping
} from './SourceMapMapping.js';
import {SourceMapConsumer}
    from 'traceur@0.0/src/outputgeneration/SourceMapIntegration.js';
import {transcode, renderSourceMap} from './transcode.js';
import {Options} from 'traceur@0.0/src/Options.js';
import {setOptionsFromSource} from './replOptions.js';

var hasError = false;
var debouncedCompile = debounced(compile, 200, 2000);
var input = CodeMirror.fromTextArea(document.querySelector('.input'), {
  lineNumbers: true,
  keyMap: 'sublime'
});
input.on('change', debouncedCompile);
input.on('cursorActivity', onInputCursorActivity);

var outputCheckbox = document.querySelector('input.output');
var output = CodeMirror.fromTextArea(
    document.querySelector('textarea.output'), {
      lineNumbers: true,
      keyMap: 'sublime',
      readOnly: true
    });
output.getWrapperElement().classList.add('output-wrapper');
var evalCheckbox = document.querySelector('input.eval');
var errorElement = document.querySelector('pre.error');
var sourceMapElement = document.querySelector('pre.source-map');

outputCheckbox.addEventListener('click', (e) => {
  document.documentElement.classList[
      outputCheckbox.checked ? 'remove' : 'add']('hide-output');
});

/**
 * debounce time = min(tmin + [func's execution time], tmax).
 *
 * @param {Function} func
 * @param {number} tmin Minimum debounce time
 * @param {number} tmax Maximum debounce time
 * @return {Function} A debounced version of func with an attached "delay"
 *     function. "delay" will delay any pending debounced function by the
 *     current debounce time. If there are none pending, it is a no-op.
 */
function debounced(func, tmin, tmax) {
  var id = 0;
  var t = tmin;
  function wrappedFunc() {
    var start = Date.now();
    id = 0;
    func();
    t = tmin + Date.now() - start; // tmin + [func's execution time]
    t = t < tmax ? t : tmax;
  }
  function debouncedFunc() {
    clearTimeout(id);
    id = setTimeout(wrappedFunc, t);
  }
  // id is nonzero only when a debounced function is pending.
  debouncedFunc.delay = () => { id && debouncedFunc(); }
  return debouncedFunc;
}

function onInputCursorActivity() {
  debouncedCompile.delay();
  updateSourceMapVisualization();
}

var markingOptions = {
  className: 'sourceMapRange',
  startStyle: 'sourceMapRangeLeft',
  endStyle: 'sourceMapRangeRight',
};

var currentSource;
var options = new Options();
var generatedMarker;
var sourceMapOutput = document.querySelector('.source-map');

function updateSourceMapVisualization(url) {
  if (!options.sourceMaps)
    return;
  if (url)
    currentSource = url;
  if (!currentSource)
    return;

  // update on compile.
  var consumer = compilationResults.sourceMapConsumer;
  var url = compilationResults.sourceMapURL;
  var originalMap = new OriginalSourceMapMapping(consumer, url);
  var generatedMap = new GeneratedSourceMapMapping(consumer, url);

  var codeMirrorPosition = input.getCursor();
  var originalPosition = {
    line: codeMirrorPosition.line + 1,
    column: codeMirrorPosition.ch,
    source: currentSource
  }

  var originalRange = originalMap.rangeFrom(originalPosition);
  var generatedRange =
      generatedMap.rangeFrom(originalMap.mapPositionFor(originalPosition));

  var generatedBeginCM = {
    line: generatedRange[0].line - 1,
    ch: generatedRange[0].column
  };
  var generatedEndCM = {
    line: generatedRange[1].line - 1,
    ch: generatedRange[1].column
  }
  if (generatedMarker)
    generatedMarker.clear();

  generatedMarker =
      output.markText(generatedBeginCM, generatedEndCM, markingOptions);
}

function showPosition(position) {
  return position.line + '.' + position.column;
}

function showRange(range) {
   return showPosition(range[0]) + ' - ' + showPosition(range[1]);
}

var compilationResults = {};

function updateLocation(contents) {
  if (history.replaceState) {
    history.replaceState(null, document.title,
                         '#' + encodeURIComponent(contents));
  }
}

function compile() {
  hasError = false;
  output.setValue('');

  var name = 'repl';
  var contents = input.getValue();
  updateLocation(contents);
  try {
    options.setFromObject(
        setOptionsFromSource(contents, resetAndCompileContents));
    compileContents(contents);
  } catch (ex) {
    onFailure(ex);
  }
}

// When options are changed we write // Options back into the source
// and recompile with these options.
function resetAndCompileContents(contents, newOptions) {
  input.setValue(contents);
  updateLocation(contents);
  options.setFromObject(newOptions);
  compileContents(contents);
}

function onFailure(error, metadata) {
  if (metadata.transcoded)
    output.setValue(metadata.transcoded);
  hasError = true;
  errorElement.hidden = false;
  errorElement.textContent = error.stack || error;
}

function compileContents(contents) {
  errorElement.hidden = true;

  function onTranscoded(metadata) {
    output.setValue(metadata.transcoded);
    if (metadata.compiler.sourceMapInfo) {
      var info = metadata.compiler.sourceMapInfo;
      compilationResults.sourceMapConsumer =
          new SourceMapConsumer(info.map);
      compilationResults.sourceMapURL = info.url;
      updateSourceMapVisualization(info.url);
    }
  }

  if (transcode)
    transcode(contents, options, onTranscoded, onFailure);
}

if (location.hash) {
  input.setValue(decodeURIComponent(location.hash.slice(1)));
} else {
  compile();
}

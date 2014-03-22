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

import {ErrorReporter} from 'traceur@0.0/src/util/ErrorReporter';
import {
  GeneratedSourceMapMapping,
  OriginalSourceMapMapping
} from './SourceMapMapping';
import {SourceMapConsumer}
    from 'traceur@0.0/src/outputgeneration/SourceMapIntegration';
import {transcode, renderSourceMap} from './transcode';
import {options as traceurOptions} from 'traceur@0.0/src/options';
import {
  setOptionsFromSource
} from './replOptions';

var hasError = false;
var debouncedCompile = debounced(compile, 200, 2000);
var input = CodeMirror.fromTextArea(document.querySelector('.input'), {
  lineNumbers: true
});
input.on('change', debouncedCompile);
input.on('cursorActivity', onInputCursorActivity);

var outputCheckbox = document.querySelector('input.output');
var output = CodeMirror.fromTextArea(
    document.querySelector('textarea.output'), {
      lineNumbers: true,
      readOnly: true
    });
output.getWrapperElement().classList.add('output-wrapper');
var evalCheckbox = document.querySelector('input.eval');
var errorElement = document.querySelector('pre.error');
var sourceMapElement = document.querySelector('pre.source-map');

if (location.hash)
  input.setValue(decodeURIComponent(location.hash.slice(1)));

outputCheckbox.addEventListener('click', function(e) {
  document.documentElement.classList[
      outputCheckbox.checked ? 'remove' : 'add']('hide-output');
}, false);

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
  debouncedFunc.delay = function() { id && debouncedFunc(); }
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
var generatedMarker;
var sourceMapOutput = document.querySelector('.source-map');

function updateSourceMapVisualization(url) {
  if (!traceurOptions.sourceMaps)
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

function compile() {
  hasError = false;
  output.setValue('');

  var name = 'repl';
  var contents = input.getValue();
  if (history.replaceState)
    history.replaceState(null, document.title,
                         '#' + encodeURIComponent(contents));

  setOptionsFromSource(contents, compile);

  errorElement.hidden = true;
  function onSuccess(mod) {
    // Empty for now.
  }
  function onFailure(errors) {
     hasError = true;
     errorElement.hidden = false;
     errorElement.textContent = errors.join('\n');
  }

  function onTranscoded(metadata, url) {
    output.setValue(metadata.transcoded);
    compilationResults = metadata;
    if (metadata.sourceMap) {
      compilationResults.sourceMapConsumer =
          new SourceMapConsumer(metadata.sourceMap);
      compilationResults.sourceMapURL = url;
      updateSourceMapVisualization(url);
    }
  }

  if (transcode)
    transcode(contents, onSuccess, onFailure, onTranscoded);
}
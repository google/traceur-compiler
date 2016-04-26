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
import {SourceMapVisualizer} from './SourceMapVisualizer.js';
import {transcode, renderSourceMap} from './transcode.js';
import {Options} from 'traceur@0.0/src/Options.js';
import {setOptionsFromSource} from './replOptions.js';

let hasError = false;
let debouncedCompile = debounced(compile, 200, 2000);
let input = CodeMirror.fromTextArea(document.querySelector('.input'), {
  lineNumbers: true,
  keyMap: 'sublime'
});
input.on('change', debouncedCompile);
input.on('cursorActivity', onInputCursorActivity);

let outputCheckbox = document.querySelector('input.output');
let output = CodeMirror.fromTextArea(
    document.querySelector('textarea.output'), {
      lineNumbers: true,
      keyMap: 'sublime',
      readOnly: true
    });
output.getWrapperElement().classList.add('output-wrapper');
let evalCheckbox = document.querySelector('input.eval');
let errorElement = document.querySelector('pre.error');

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
  let id = 0;
  let t = tmin;
  function wrappedFunc() {
    let start = Date.now();
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
  sourceMapVisualizer.updateUI();
}

function updateLocation(contents) {
  if (history.replaceState) {
    history.replaceState(null, document.title,
                         '#' + encodeURIComponent(contents));
  }
}

let options = new Options();

function compile() {
  hasError = false;
  output.setValue('');

  let name = 'repl';
  let contents = input.getValue();
  updateLocation(contents);
  try {
    options.setFromObject(
        setOptionsFromSource(contents, resetAndCompileContents));
    compileContents(contents);
  } catch (ex) {
    onFailure(ex);
  }
}

let sourceMapVisualizer = new SourceMapVisualizer(input, output);

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

  let s;
  if (error) {
    if (error.stack) {
      s = error.stack;
    } else if (error.name === 'MultipleErrors') {
      s = error.errors.join('\n');
    }
  } else {
    s = String(error);
  }
  errorElement.textContent = s;
}

function compileContents(contents) {
  errorElement.hidden = true;

  function onTranscoded(metadata) {
    output.setValue(metadata.transcoded);
    if (metadata.compiler.sourceMapInfo) {
      let info = metadata.compiler.sourceMapInfo;
      sourceMapVisualizer.updateMap(info);
    } else {
      sourceMapVisualizer.updateMap({sourceMapURL: null});
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

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
import {options as traceurOptions} from 'traceur@0.0/src/options';
import {transcode, renderSourceMap} from './transcode';

// Do not show source maps by default.
traceurOptions.sourceMaps = false;

var hasError = false;
var debouncedCompile = debounced(compile, 200, 2000);
var input = CodeMirror.fromTextArea(document.querySelector('.input'), {
  onChange: debouncedCompile,
  onCursorActivity: debouncedCompile.delay,
  lineNumbers: true
});
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

function setOptionsFromSource(source) {
  var re = /^\/\/ Options:\s*(.+)$/mg;
  var optionLines = source.match(re);
  if (optionLines) {
    optionLines.forEach(function(line) {
      re.lastIndex = 0;
      var m = re.exec(line);
      try {
        traceurOptions.fromString(m[1]);
      } catch (ex) {
        // Ignore unknown options.
      }
    });
    createOptions();
  }
}

function compile() {
  hasError = false;
  output.setValue('');

  var name = 'repl';
  var contents = input.getValue();
  if (history.replaceState)
    history.replaceState(null, document.title,
                         '#' + encodeURIComponent(contents));

  setOptionsFromSource(contents);

  errorElement.hidden = true;
  function onSuccess(mod) {
    // Empty for now.
  }
  function onFailure(errors) {
     hasError = true;
     errorElement.hidden = false;
     errorElement.textContent = errors.join('\n');
  }

  function onTranscoded(metadata) {
    output.setValue(metadata.transcoded);
    var sourceMap = metadata.sourceMap;
    if (sourceMap) {
      var renderedMap = renderSourceMap(metadata.transcoded, sourceMap);
      sourceMapElement.textContent = renderedMap;
    } else {
      sourceMapElement.textContent = '';
    }
  }

  if (transcode)
    transcode(contents, onSuccess, onFailure, onTranscoded);
}

function createOptionRow(name) {
  var label = document.createElement('label');
  label.textContent = name;
  var cb = label.insertBefore(document.createElement('input'),
                              label.firstChild);
  cb.type = 'checkbox';
  var checked = traceurOptions[name];
  cb.checked = checked;
  cb.indeterminate = checked === null;
  cb.onclick = function() {
    traceurOptions[name] = cb.checked;
    createOptions();
    compile();
  };
  return label;
}

var extraOptions = [
  'experimental',
  'debug',
  'sourceMaps',
  'freeVariableChecker',
  'validate'
];

var showAllOpts = false;
var allOptsLength = Object.keys(traceurOptions).length;
var showMax = allOptsLength;

function createOptions() {
  var optionsDiv = document.querySelector('.traceur-options');
  optionsDiv.textContent = '';
  if (showAllOpts) {
    var i = 0;
    Object.keys(traceurOptions).forEach(function(name) {
      if (i++ >= showMax || extraOptions.lastIndexOf(name) >= 0)
        return;
      optionsDiv.appendChild(createOptionRow(name));
    });
    optionsDiv.appendChild(document.createElement('hr'));
  }
  extraOptions.forEach(function(name) {
    optionsDiv.appendChild(createOptionRow(name));
  });
}

createOptions();

function rebuildOptions() {
  var optionsDiv = document.querySelector('.traceur-options');
  optionsDiv.innerHTML = '';
  createOptions();
}

document.querySelector('.reset-all').addEventListener('click',
    function() {
      traceurOptions.reset();
      rebuildOptions();
    });

document.querySelector('.all-off').addEventListener('click',
    function() {
      traceurOptions.reset(true);
      rebuildOptions();
    });

document.querySelector('.show-all-toggle').addEventListener('click',
    function() {
      showAllOpts = !showAllOpts;
      rebuildOptions();
    });

document.querySelector('.option-button').addEventListener('click',
    function() {
      var optionsDiv = document.querySelector('.options');
      optionsDiv.hidden = !optionsDiv.hidden;
    });

var codeCur = 0;
var code = 'UUDDLRLRBA'.split('').map(function(k) {
  return {'U': 38, 'D': 40, 'L': 37, 'R': 39, 'A': 65, 'B': 66}[k];
});

document.addEventListener('keyup', function(e) {
  if (e.keyCode !== code[codeCur++])
    codeCur = +(e.keyCode === code[0]);
  if (codeCur === code.length) {
    var optionsDiv = document.querySelector('.options');
    optionsDiv.hidden = false;
    optionsDiv.classList.add('god0');
    window.setInterval(updateTransition, 500);
    showAllOpts = !showAllOpts;
    showMax = 0;
    rebuildAnimate();
  }
})

function rebuildAnimate() {
  if (showMax++ >= allOptsLength)
    return;
  rebuildOptions();
  var optionsDiv = document.querySelector('.options');
  setTimeout(rebuildAnimate, 1000);
}

function updateTransition() {
  var optionsDiv;
  for (var i = 0; i < 2; i++) {
    if (optionsDiv = document.querySelector('.god' + i)) {
      optionsDiv.classList.remove('god' + i);
      optionsDiv.classList.add('god' + (i + 1) % 2);
      break;
    }
  }
}

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

import {options as traceurOptions} from 'traceur@0.0/src/options';

// Show correlation of input and generated source by default
traceurOptions.sourceMaps = true;

var optionChangeHandler;

export function setOptionsFromSource(source, onOptionChanged) {
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
  optionChangeHandler = onOptionChanged;
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
    optionChangeHandler();
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

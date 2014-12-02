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
  Options,
  CommandOptions,
  versionLockedOptions,
  toDashCase
} from 'traceur@0.0/src/Options.js';


var optionChangeHandler;
var traceurOptions;
var showAllOpts = false;
var allOptsLength;
var showMax;
var firstPass = true;
var reOptions = /^\/\/ Options:\s*(.+)$/mg;

export function setOptionsFromSource(source, onOptionChanged) {

  // Start with default options.
  traceurOptions = new Options();

  // Mutate these options with source-defined // Options values.
  var optionLines = source.match(reOptions);
  if (optionLines) {
    optionLines.forEach(function(line) {
      reOptions.lastIndex = 0;
      var m = reOptions.exec(line);
      traceurOptions.setFromObject(CommandOptions.fromString(m[1]));
      if (firstPass) {
        // Show correlation of input and generated source by default
        traceurOptions.sourceMaps = true;
        firstPass = false;
      }
    });
  }
  createMatchingOptionControls(traceurOptions);
  optionChangeHandler = (newOptions) => {
    source = prependSourceWithNewOptions(newOptions, source);
    onOptionChanged(source, newOptions);
  };

  allOptsLength = Object.keys(traceurOptions).length;
  showMax = allOptsLength;

  return traceurOptions;
}

function optionsToSource(newOptions) {
  var line = '';
  for (var key in versionLockedOptions) {
    if (versionLockedOptions[key] !== newOptions[key]) {
      line += '--' + toDashCase(key);
      if (!newOptions[key])
        line += '=' + newOptions[key];
      line += ' ';
    }
  }
  return line && '// Options: ' + line + '\n';
}

function prependSourceWithNewOptions(newOptions, source) {
  source = source.split('\n').reduce((linesNoOptions, line) => {
    reOptions.lastIndex = 0;
    if (!reOptions.test(line))
      linesNoOptions.push(line);
    return linesNoOptions;
  }, []).join('\n');
  return optionsToSource(newOptions) + source;
}

function createOptionRow(traceurOptions, name) {
  var label = document.createElement('label');
  label.textContent = name;
  var cb = label.insertBefore(document.createElement('input'),
                              label.firstChild);
  cb.type = 'checkbox';
  var checked = traceurOptions[name];
  cb.checked = checked;
  cb.indeterminate = checked === null;
  cb.onclick = () => {
    traceurOptions[name] = cb.checked;
    optionChangeHandler(traceurOptions);
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

function createMatchingOptionControls(traceurOptions) {
  var optionsDiv = document.querySelector('.traceur-options');
  optionsDiv.textContent = '';
  if (showAllOpts) {
    var i = 0;
    Object.keys(traceurOptions).forEach((name) => {
      if (i++ >= showMax || extraOptions.lastIndexOf(name) >= 0)
        return;
      optionsDiv.appendChild(createOptionRow(traceurOptions, name));
    });
    optionsDiv.appendChild(document.createElement('hr'));
  }
  extraOptions.forEach((name) => {
    optionsDiv.appendChild(createOptionRow(traceurOptions, name));
  });
}

function rebuildOptions(traceurOptions) {
  var optionsDiv = document.querySelector('.traceur-options');
  createMatchingOptionControls(traceurOptions);
}

document.querySelector('.reset-all').addEventListener('click', () => {
  traceurOptions.reset();
  rebuildOptions(traceurOptions);
});

document.querySelector('.all-off').addEventListener('click', () => {
  traceurOptions.reset(true);
  rebuildOptions(traceurOptions);
});

document.querySelector('.show-all-toggle').addEventListener('click', () => {
  showAllOpts = !showAllOpts;
  rebuildOptions(traceurOptions);
});

document.querySelector('.option-button').addEventListener('click', () => {
  var optionsDiv = document.querySelector('.options');
  optionsDiv.hidden = !optionsDiv.hidden;
});

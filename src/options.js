// Copyright 2012 Traceur Authors.
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

export var parseOptions = Object.create(null);
export var transformOptions = Object.create(null);
var defaultValues = Object.create(null);
var experimentalOptions = Object.create(null);

/**
 * The options object.
 */
export var options = {

  /**
   * Meta option. Sets all options that are of Kind.experimental
   * When getting this will return null if not all options of this kind
   * have the same value.
   * @type {boolean|string|null}
   */
  set experimental(v) {
    v = coerceOptionValue(v);
    Object.keys(experimentalOptions).forEach((name) => {
      options[name] = v;
    });
  },
  get experimental() {
    var value;
    Object.keys(experimentalOptions).every((name) => {
      var currentValue = options[name];
      if (value === undefined) {
        value = currentValue;
        return true;
      }
      if (currentValue !== value) {
        value = null;
        return false;
      }
      return true;
    });
    return value;
  }
};

// TODO: Refactor this so that we can keep all of these in one place.
var descriptions = {
  experimental: 'Turns on all experimental features'
};

/**
 * Resets all options to the default value or to false if |allOff| is
 * true.
 * @param {boolean=} allOff
 */
function reset(allOff = undefined) {
  var useDefault = allOff === undefined;
  Object.keys(options).forEach((name) => {
    options[name] = useDefault && defaultValues[name];
  });
}

/**
 * Takes a string and parses it and sets the options based on that
 * string.
 */
function fromString(s) {
  fromArgv(s.split(/\s+/));
}

/**
 * Takes an array of command line params sets the options based on that.
 */
function fromArgv(args) {
  args.forEach(parseCommand);
}

/**
 * Sets the options based on an object.
 * setFromObject({
 *   spread: true,
 *   defaultParameters: false,
 *   desctructuring: 'parse'
 * });
 */
function setFromObject(object) {
  Object.keys(object).forEach((name) => {
    options[name] = object[name];
  });
}

function coerceOptionValue(v) {
  switch (v) {
    case 'false':
    case false:
      return false;
    case 'parse':
      return 'parse';
    default:
      return true;
  }
}

function setOption(name, value) {
  name = toCamelCase(name);
  value = coerceOptionValue(value);
  if (name in options) {
    options[name] = value;
  } else {
    throw Error('Unknown option: ' + name);
  }
}

function optionCallback(name, value) {
  setOption(name, value);
}

/**
 * This is called by build.js to add options to the commander command line
 * library.
 * @param {Commander} flags The commander object.
 */
function addOptions(flags) {
  Object.keys(options).forEach(function(name) {
    var dashedName = toDashCase(name);
    if ((name in parseOptions) && (name in transformOptions))
      flags.option('--' + dashedName + ' [true|false|parse]',
                   descriptions[name]);
    else
      flags.option('--' + dashedName, descriptions[name]);
    flags.on(dashedName, optionCallback.bind(null, dashedName));
  });
}

/**
 * This is called to determine whether the option should be included in the
 * --help text used by command line utilities.
 */
function filterOption(dashedName) {
  var name = toCamelCase(dashedName);
  return name === 'experimental' || !(name in options);
}

// Make sure non option fields are non enumerable.
Object.defineProperties(options, {
  parse: {value: parseOptions},
  transform: {value: transformOptions},
  reset: {value: reset},
  fromString: {value: fromString},
  fromArgv: {value: fromArgv},
  setFromObject: {value: setFromObject},
  addOptions: {value: addOptions},
  filterOption: {value: filterOption}
});

/**
 * Parses a part of a command line and sets the respective option.
 * The following patterns are supported.
 *
 *   --spread, --spread=true
 *   --spread=parse
 *   --spead=false
 *   --arrowFunctions --arrow-functions
 */
function parseCommand(s) {
  var re = /--([^=]+)(?:=(.+))?/;
  var m = re.exec(s);
  if (m)
    setOption(m[1], m[2]);
}

/**
 * Converts a string from aaa-bbb-ccc ot aaaBbbCcc
 */
function toCamelCase(s) {
  return s.replace(/-\w/g, function(ch) {
    return ch[1].toUpperCase();
  });
}

/**
 * Converts a string from aaa-bbb-ccc ot aaaBbbCcc
 */
function toDashCase(s) {
  return s.replace(/[A-W]/g, function(ch) {
    return '-' + ch.toLowerCase();
  });
}

var EXPERIMENTAL = 0;
var ON_BY_DEFAULT = 1;

/**
 * Adds a feature option.
 * Each feature option is represented by the parse and transform
 * option with the same name.
 * Setting a feature option sets the parse and transform option.
 */
function addFeatureOption(name, kind) {
  if (kind === EXPERIMENTAL)
    experimentalOptions[name] = true;

  Object.defineProperty(options, name, {
    get: function() {
      if (parseOptions[name] === transformOptions[name]) {
        return parseOptions[name];
      }
      return 'parse';
    },
    set: function(v) {
      if (v === 'parse') {
        parseOptions[name] = true;
        transformOptions[name] = false;
      } else {
        parseOptions[name] = transformOptions[name] = Boolean(v);
      }
    },
    enumerable: true,
    configurable: true
  });

  var defaultValue = kind === ON_BY_DEFAULT;
  defaultValues[name] = defaultValue;
  parseOptions[name] = defaultValue;
  transformOptions[name] = defaultValue;
}

/**
 * Adds a simple boolean option.
 */
function addBoolOption(name) {
  defaultValues[name] = false;
  options[name] = false;
}

// ON_BY_DEFAULT
addFeatureOption('arrayComprehension', ON_BY_DEFAULT); // 11.4.1.2
addFeatureOption('arrowFunctions', ON_BY_DEFAULT);     // 13.2
addFeatureOption('classes', ON_BY_DEFAULT);            // 13.5
addFeatureOption('defaultParameters', ON_BY_DEFAULT);  // Cant find in the spec
addFeatureOption('destructuring', ON_BY_DEFAULT);      // 11.13.1
addFeatureOption('forOf', ON_BY_DEFAULT);              // 12.6.4
addFeatureOption('propertyMethods', ON_BY_DEFAULT);    // 13.3
addFeatureOption('propertyNameShorthand', ON_BY_DEFAULT);
addFeatureOption('templateLiterals', ON_BY_DEFAULT);   // 7.6.8
addFeatureOption('restParameters', ON_BY_DEFAULT);     // 13.1
addFeatureOption('spread', ON_BY_DEFAULT);             // 11.1.4, 11.2.5
addFeatureOption('generatorComprehension', ON_BY_DEFAULT);
addFeatureOption('generators', ON_BY_DEFAULT); // 13.4, incomplete
addFeatureOption('modules', ON_BY_DEFAULT);    // 14

// EXPERIMENTAL
addFeatureOption('blockBinding', EXPERIMENTAL);       // 12.1
addFeatureOption('privateNameSyntax', EXPERIMENTAL);
addFeatureOption('privateNames', EXPERIMENTAL);
addFeatureOption('cascadeExpression', EXPERIMENTAL);
addFeatureOption('trapMemberLookup', EXPERIMENTAL);
addFeatureOption('deferredFunctions', EXPERIMENTAL);
addFeatureOption('propertyOptionalComma', EXPERIMENTAL);
addFeatureOption('types', EXPERIMENTAL);

addBoolOption('debug');
addBoolOption('sourceMaps');
addBoolOption('freeVariableChecker');
addBoolOption('validate');
addBoolOption('strictSemicolons');
addBoolOption('unstarredGenerators');
addBoolOption('ignoreNolint');

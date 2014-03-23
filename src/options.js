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

// Options are just a plain old object. There are two read only views on this
// object, parseOptions and transformOptions.
//
// To set an option you do `options.classes = true`.
//
// An option value is either true, false or a string. If the value is set to
// the string "parse" then the transformOption for that option will return
// false. For example:
//
//   options.destructuring = 'parse';
//   transformOptions.destructuring === false;

export var parseOptions = Object.create(null);
export var transformOptions = Object.create(null);

var defaultValues = Object.create(null);
var experimentalOptions = Object.create(null);
var moduleOptions = ['amd', 'commonjs', 'instantiate', 'inline', 'register'];

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
  },

  modules_: 'register',

  get modules() {
    return this.modules_;
  },

  set modules(value) {
    if (typeof value === 'boolean' && !value)
      value = 'register';
    if (moduleOptions.indexOf(value) === -1) {
      throw new Error('Invalid \'modules\' option \'' + value + '\', not in ' +
        moduleOptions.join(', '));
    }
    this.modules_ = value;
  },

  scripts: []
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
 */
function setFromObject(object) {
  Object.keys(object).forEach((name) => {
    options[name] = object[name];
  });
}

function coerceOptionValue(v) {
  switch (v) {
    case 'false':
      return false;
    case 'true':
    case true:
      return true;
    default:
      // Falsey values will be false.
      return !!v && String(v);
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

/**
 * This is called by build.js to add options to the commander command line
 * library.
 * @param {Commander} flags The commander object.
 */
function addOptions(flags) {
  Object.keys(options).forEach(function(name) {
    var dashedName = toDashCase(name);
    if ((name in parseOptions) && (name in transformOptions)) {
      flags.option('--' + dashedName + ' [true|false|parse]',
                   descriptions[name]);
      flags.on(dashedName, (value) => setOption(dashedName, value));
    }
    // If the option value is null then it's not a boolean option and should
    // be added separately.
    else if (options[name] !== null) {
      flags.option('--' + dashedName, descriptions[name]);
      flags.on(dashedName, () => setOption(dashedName, true));
    }
  });
  flags.option('--referrer <name>',
    'Bracket output code with System.referrerName=<name>',
    (name) => {
      setOption('referrer', name);
      return name;
    });
  flags.option('--type-assertion-module <path>',
    'Absolute path to the type assertion module.',
    (path) => {
      setOption('type-assertion-module', path);
      return path;
    });
  flags.option('--script <fileName>',
    'Parse as Script (must precede modules)',
    (fileName) => {
      options.scripts.push(fileName);
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
 *   --spread=false
 *   --arrowFunctions --arrow-functions
 *   --modules=amd
 */
function parseCommand(s) {
  var re = /--([^=]+)(?:=(.+))?/;
  var m = re.exec(s);
  if (m)
    setOption(m[1], m[2] || true);
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
 * This also adds a view from the parseOption and the transformOption to the
 * underlying value.
 */
function addFeatureOption(name, kind) {
  if (kind === EXPERIMENTAL)
    experimentalOptions[name] = true;

  Object.defineProperty(parseOptions, name, {
    get: function() {
      return !!options[name];
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(transformOptions, name, {
    get: function() {
      var v = options[name];
      if (v === 'parse')
        return false;
      return v;
    },
    enumerable: true,
    configurable: true
  });

  var defaultValue = options[name] || kind === ON_BY_DEFAULT;
  options[name] = defaultValue;
  defaultValues[name] = defaultValue;
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
addFeatureOption('computedPropertyNames', ON_BY_DEFAULT);  // 11.1.5
addFeatureOption('defaultParameters', ON_BY_DEFAULT);  // Cant find in the spec
addFeatureOption('destructuring', ON_BY_DEFAULT);      // 11.13.1
addFeatureOption('forOf', ON_BY_DEFAULT);              // 12.6.4
addFeatureOption('generatorComprehension', ON_BY_DEFAULT);
addFeatureOption('generators', ON_BY_DEFAULT); // 13.4
addFeatureOption('modules', ON_BY_DEFAULT);    // 14
addFeatureOption('numericLiterals', ON_BY_DEFAULT);
addFeatureOption('propertyMethods', ON_BY_DEFAULT);    // 13.3
addFeatureOption('propertyNameShorthand', ON_BY_DEFAULT);
addFeatureOption('restParameters', ON_BY_DEFAULT);     // 13.1
addFeatureOption('spread', ON_BY_DEFAULT);             // 11.1.4, 11.2.5
addFeatureOption('templateLiterals', ON_BY_DEFAULT);   // 7.6.8

// EXPERIMENTAL
addFeatureOption('asyncFunctions', EXPERIMENTAL);
addFeatureOption('blockBinding', EXPERIMENTAL);       // 12.1
addFeatureOption('symbols', EXPERIMENTAL);
addFeatureOption('types', EXPERIMENTAL);
addFeatureOption('annotations', EXPERIMENTAL);

addBoolOption('commentCallback');
addBoolOption('debug');
addBoolOption('freeVariableChecker');
addBoolOption('sourceMaps');
addBoolOption('typeAssertions');
addBoolOption('validate');

defaultValues.referrer = '';
options.referrer = null;

defaultValues.typeAssertionModule = null;
options.typeAssertionModule = null;

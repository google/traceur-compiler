// Copyright 2012 Google Inc.
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

/**
 * The options are classified into three categories. This enum represents
 * which kind of category an option belong to.
 * @enum {string}
 */
var Kind = {
  /**
   * This includes all the implemented features that are also in the ES6
   * spec draft. See the latest drafts at:
   *    http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts
   */
  es6: 'es6',

  /**
   * This is used for accepted ES6 features that are not yet in a draft of the
   * spec. See the full list of accepted proposals here:
   *   http://wiki.ecmascript.org/doku.php?id=harmony:proposals
   */
  es6proposal: 'es6proposal',

  /**
   * This is used for the Harmony features that are not yet in any draft. These
   * are a subset of the proposals on the ES wiki:
   *   http://wiki.ecmascript.org/doku.php?id=harmony:proposals
   */
  harmony: 'harmony',

  /**
   * For features that are not yet on the ES wiki
   */
  experimental: 'experimental'
};

var kindMapping = Object.create(null);
Object.keys(Kind).forEach((kind) => {
  kindMapping[kind] = Object.create(null);
});

function enable(kind, b) {
  Object.keys(kindMapping[kind]).forEach((name) => {
    options[name] = b;
  });
}

function getValue(kind) {
  var value;
  Object.keys(kindMapping[kind]).every((name) => {
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

export var parseOptions = Object.create(null);
export var transformOptions = Object.create(null);
var defaultValues = Object.create(null);

/**
 * The options object.
 */
export var options = {
  /**
   * Meta option. Sets all options that are of Kind.es6
   * When getting this will return null if not all options of this kind
   * have the same value.
   * @type {boolean|string|null}
   */
  set es6(v) {
    enable(Kind.es6, coerceOptionValue(v));
  },
  get es6() {
    return getValue(Kind.es6);
  },

  /**
   * Meta option. Sets all options that are of Kind.es6proposal
   * When getting this will return null if not all options of this kind
   * have the same value.
   * @type {boolean|string|null}
   */
  set es6proposal(v) {
    enable(Kind.es6proposal, coerceOptionValue(v));
  },
  get es6proposal() {
    return getValue(Kind.es6proposal);
  },

  /**
   * Meta option. Sets all options that are of Kind.harmony
   * When getting this will return null if not all options of this kind
   * have the same value.
   * @type {boolean|string|null}
   */
  set harmony(v) {
    enable(Kind.harmony, coerceOptionValue(v));
  },
  get harmony() {
    return getValue(Kind.harmony);
  },

  /**
   * Meta option. Sets all options that are of Kind.experimental
   * When getting this will return null if not all options of this kind
   * have the same value.
   * @type {boolean|string|null}
   */
  set experimental(v) {
    enable(Kind.experimental, coerceOptionValue(v));
  },
  get experimental() {
    return getValue(Kind.experimental);
  }
};

/**
 * Resets all options to the default value or to false if |opt_allOff| is
 * true.
 * @param {boolean=} opt_allOff
 */
function reset(opt_allOff) {
  var useDefault = opt_allOff === undefined;
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
      flags.option('--' + dashedName + ' [true|false|parse]');
    else
      flags.option('--' + dashedName + ' [true|false]');
    flags.on(dashedName, optionCallback.bind(null, dashedName));
  });
}

// Make sure non option fields are non enumerable.
Object.defineProperties(options, {
  parse: {value: parseOptions},
  transform: {value: transformOptions},
  reset: {value: reset},
  fromString: {value: fromString},
  fromArgv: {value: fromArgv},
  setFromObject: {value: setFromObject},
  addOptions: {value: addOptions}
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

/**
 * Adds a feature option.
 * Each feature option is represented by the parse and transform
 * option with the same name.
 * Setting a feature option sets the parse and transform option.
 */
function addFeatureOption(name, kind) {
  kindMapping[kind][name] = true;
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

  var defaultValue = kind !== Kind.experimental;
  defaultValues[name] = defaultValue;
  parseOptions[name] = defaultValue;
  transformOptions[name] = defaultValue;
}

/**
 * Adds a simple boolean option.
 */
function addBoolOption(name) {
  defaultValues[name] = true;
  options[name] = true;
}

addFeatureOption('arrayComprehension', Kind.es6); // 11.4.1.2
addFeatureOption('arrowFunctions', Kind.es6);     // 13.2
addFeatureOption('blockBinding', Kind.es6);       // 12.1
addFeatureOption('classes', Kind.es6);            // 13.5
addFeatureOption('defaultParameters', Kind.es6);  // Cant find this in the spec
addFeatureOption('destructuring', Kind.es6);      // 11.13.1
addFeatureOption('forOf', Kind.es6);              // 12.6.4
addFeatureOption('isExpression', Kind.es6);       // 11.9
addFeatureOption('propertyMethods', Kind.es6);    // 13.3
addFeatureOption('propertyNameShorthand', Kind.es6);
addFeatureOption('templateLiterals', Kind.es6);   // 7.6.8
addFeatureOption('restParameters', Kind.es6);     // 13.1
addFeatureOption('spread', Kind.es6);             // 11.1.4, 11.2.5

addFeatureOption('generatorComprehension', Kind.es6proposal);
addFeatureOption('generators', Kind.es6proposal); // 13.4, incomplete
addFeatureOption('modules', Kind.es6proposal);    // 14
addFeatureOption('privateNameSyntax', Kind.es6proposal);
addFeatureOption('privateNames', Kind.es6proposal);

addFeatureOption('cascadeExpression', Kind.experimental);
addFeatureOption('trapMemberLookup', Kind.experimental);
addFeatureOption('deferredFunctions', Kind.experimental);
addFeatureOption('propertyOptionalComma', Kind.experimental);
addFeatureOption('strictSemicolons', Kind.experimental);
addFeatureOption('types', Kind.experimental);

addBoolOption('debug');
addBoolOption('sourceMaps');
addBoolOption('freeVariableChecker');
addBoolOption('validate');

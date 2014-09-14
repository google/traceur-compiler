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


function enumerableOnlyObject(obj) {
  var result = Object.create(null);
  Object.keys(obj).forEach(function(key) {
    Object.defineProperty(result, key, {enumerable: true, value: obj[key]});
  });
  return result;
}

// Traceur sets these default options and no others for v 0.1.*
export var optionsV01 = enumerableOnlyObject({
  annotations: false,
  arrayComprehension: false,
  arrowFunctions: true,
  asyncFunctions: false,
  blockBinding: true,
  classes: true,
  commentCallback: false,
  computedPropertyNames: true,
  debug: false,
  defaultParameters: true,
  destructuring: true,
  exponentiation: false,
  forOf: true,
  freeVariableChecker: false,
  generatorComprehension: false,
  generators: true,
  moduleName: false,
  modules: 'register',
  numericLiterals: true,
  outputLanguage: 'es5',
  propertyMethods: true,
  propertyNameShorthand: true,
  referrer: '',
  unicodeExpressions: true,
  restParameters: true,
  script: false,
  sourceMaps: false,
  spread: true,
  symbols: false,
  templateLiterals: true,
  typeAssertionModule: null,
  typeAssertions: false,
  types: false,
  unicodeEscapeSequences: true,
  validate: false,
});

export var versionLockedOptions = optionsV01;

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
//   parseOptions.destructuring === true;
//   transformOptions.destructuring === false;
//
// This allows you to parse certain features without transforming them, leaving
// the syntax intact in the outputted code.

export var parseOptions = Object.create(null);
export var transformOptions = Object.create(null);

var defaultValues = Object.create(null);
var experimentalOptions = Object.create(null);
var moduleOptions = ['amd', 'commonjs', 'instantiate', 'inline', 'register'];

export class Options {

  constructor(options = Object.create(null)) {
    this.reset();

    // Make sure non option fields are non enumerable.
    Object.defineProperties(this, {
      modules_: {value: versionLockedOptions.modules, writable: true, enumerable: false}
    });

    this.setFromObject(options);
  }

  /**
   * Meta option. Sets all options that are of Kind.experimental
   * When getting this will return null if not all options of this kind
   * have the same value.
   * @type {boolean|string|null}
   */
  set experimental(v) {
    v = coerceOptionValue(v);
    Object.keys(experimentalOptions).forEach((name) => {
      this[name] = v;
    });
  }

  get experimental() {
    var value;
    Object.keys(experimentalOptions).every((name) => {
      var currentValue = this[name];
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

  get modules() {
    return this.modules_;
  }

  set modules(value) {
    if (typeof value === 'boolean' && !value)
      value = 'register';
    if (moduleOptions.indexOf(value) === -1) {
      throw new Error('Invalid \'modules\' option \'' + value + '\', not in ' +
        moduleOptions.join(', '));
    }
    this.modules_ = value;
  }
  /**
   * Resets all options to the default value or to false if |allOff| is
   * true.
   * @param {boolean=} allOff
   */
  reset(allOff = undefined) {
    var useDefault = allOff === undefined;
    Object.keys(defaultValues).forEach((name) => {
      this[name] = useDefault && defaultValues[name];
    });
    this.setDefaults();
  }
  /**
   * Set values into options which should not have boolean false values.
   */
  setDefaults() {
    this.modules = 'register';
    this.moduleName = false;
    this.outputLanguage = 'es5';
    this.referrer = '';
    this.typeAssertionModule = null;
  }
  /**
   * Sets the options based on an object.
   */
  setFromObject(object) {
    Object.keys(object).forEach((name) => {
      this.setOption(name, object[name]);
    });
    this.modules = object.modules || this.modules;
    return this;
  }

  setOption(name, value) {
    name = toCamelCase(name);
    if (name in this) {
      this[name] = value;
    } else {
      throw Error('Unknown option: ' + name);
    }
  }

  diff(ref) {
    var mismatches = [];
    Object.keys(options).forEach((key) => {
      if (this[key] !== ref[key]) {
        mismatches.push({
          key: key,
          now: traceur.options[key],
          v01: ref[key]
        });
      }
    });
    return mismatches;
  }

};


// A distinguish instance shared internally via module
//
export var options = new Options();


// TODO: Refactor this so that we can keep all of these in one place.
var descriptions = {
  experimental: 'Turns on all experimental features',
  sourceMaps: 'generate source map and write to .map',
};

export class CommandOptions extends Options {

  /**
   * Takes a string and parses it and sets the options based on that
   * string.
   */
  static fromString(s) {
    return CommandOptions.fromArgv(s.split(/\s+/));
  }

  /**
   * Takes an array of command line params and sets the options based on that.
   */
  static fromArgv(args) {
    var options = new CommandOptions();
    args.forEach((arg) => options.parseCommand(arg));
    return options;
  }
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
  parseCommand(s) {
    var re = /--([^=]+)(?:=(.+))?/;
    var m = re.exec(s);
    if (m) {
      var value = true;
      if (typeof m[2] !== 'undefined')
        value = coerceOptionValue(m[2]);
      this.setOption(m[1],  value);
    }
  }

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

/**
 * TODO(jjb): move to src/node
 * This is called by build.js to add options to the commander command line
 * library.
 * @param {Commander} flags The commander object.
 */
export function addOptions(flags, commandOptions) {
  // Start with the non-boolean options.
  flags.option('--referrer <name>',
      'Bracket output code with System.referrerName=<name>',
      (name) => {
        commandOptions.setOption('referrer', name);
        System.map = System.semverMap(name);
        return name;
      });
  flags.option('--type-assertion-module <path>',
      'Absolute path to the type assertion module.',
      (path) => {
        commandOptions.setOption('type-assertion-module', path);
        return path;
      });
  flags.option('--modules <' + moduleOptions.join(', ') + '>',
      'select the output format for modules',
      (moduleFormat) => {
        commandOptions.modules = moduleFormat;
      });
  flags.option('--moduleName <string>',
    '__moduleName value, + sign to use source name, or empty to omit',
    (moduleName) => {
      if (moduleName === '+')
        moduleName = true;
      commandOptions.moduleName = moduleName;
    });
  flags.option('--outputLanguage <es6|es5>',
    'compilation target language',
    (outputLanguage) => {
      if (outputLanguage === 'es6' || outputLanguage === 'es5')
        commandOptions.outputLanguage = outputLanguage;
      else
        throw new Error('outputLanguage must be one of es5, es6');
  });
  flags.option('--experimental',
    'Turns on all experimental features',
    () => { commandOptions.experimental = true; }
  );

  Object.keys(commandOptions).forEach(function(name) {
    var dashedName = toDashCase(name);
    if (flags.optionFor('--' + name) || flags.optionFor('--' + dashedName)) {
      return;   // non-boolean already in flags.
    } else if ((name in parseOptions) && (name in transformOptions)) {
      flags.option('--' + dashedName + ' [true|false|parse]',
                   descriptions[name]);
      flags.on(dashedName, (value) => commandOptions.setOption(dashedName, value));
    } else if (commandOptions[name] !== null) {
      flags.option('--' + dashedName, descriptions[name]);
      flags.on(dashedName, () => commandOptions.setOption(dashedName, true));
    } else {
      throw new Error('Unexpected null commandOption ' + name);
    }
  });
  // After we've processed the commandOptions, set defaults for commandOptions.
  commandOptions.setDefaults();
}



/**
 * Converts a string from aaa-bbb-ccc to aaaBbbCcc.
 */
function toCamelCase(s) {
  return s.replace(/-\w/g, function(ch) {
    return ch[1].toUpperCase();
  });
}

/**
 * Converts a string from aaaBbbCcc to aaa-bbb-ccc.
 */
export function toDashCase(s) {
  return s.replace(/[A-Z]/g, function(ch) {
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
addFeatureOption('arrowFunctions', ON_BY_DEFAULT);     // 13.2
addFeatureOption('blockBinding', ON_BY_DEFAULT);       // 12.1
addFeatureOption('classes', ON_BY_DEFAULT);            // 13.5
addFeatureOption('computedPropertyNames', ON_BY_DEFAULT);  // 11.1.5
addFeatureOption('defaultParameters', ON_BY_DEFAULT);  // Cant find in the spec
addFeatureOption('destructuring', ON_BY_DEFAULT);      // 11.13.1
addFeatureOption('forOf', ON_BY_DEFAULT);              // 12.6.4
addFeatureOption('generators', ON_BY_DEFAULT); // 13.4
addFeatureOption('modules', 'SPECIAL');    // 14
addFeatureOption('numericLiterals', ON_BY_DEFAULT);
addFeatureOption('propertyMethods', ON_BY_DEFAULT);    // 13.3
addFeatureOption('propertyNameShorthand', ON_BY_DEFAULT);
addFeatureOption('restParameters', ON_BY_DEFAULT);     // 13.1
addFeatureOption('spread', ON_BY_DEFAULT);             // 11.1.4, 11.2.5
addFeatureOption('templateLiterals', ON_BY_DEFAULT);   // 7.6.8
addFeatureOption('unicodeEscapeSequences', ON_BY_DEFAULT);  // 11.8.4
addFeatureOption('unicodeExpressions', ON_BY_DEFAULT);

// EXPERIMENTAL
addFeatureOption('annotations', EXPERIMENTAL);
addFeatureOption('arrayComprehension', EXPERIMENTAL); // 11.4.1.2
addFeatureOption('asyncFunctions', EXPERIMENTAL);
addFeatureOption('exponentiation', EXPERIMENTAL);
addFeatureOption('generatorComprehension', EXPERIMENTAL);
addFeatureOption('symbols', EXPERIMENTAL);
addFeatureOption('types', EXPERIMENTAL);

addBoolOption('commentCallback');
addBoolOption('debug');
addBoolOption('freeVariableChecker');
addBoolOption('script');
addBoolOption('sourceMaps');
addBoolOption('typeAssertions');
addBoolOption('validate');

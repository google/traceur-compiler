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

(function() {

  /**
   * The options are classified into three categories. This enum represents
   * which kind of category an option belong to.
   * @enum {string}
   */
  var Kind = {
    /**
     * This includes all the implemented features that are also in the ES6
     * spec draft.
     */
    es6: 'es6',

    /**
     * This is used for the Harmony features that are not yet in ES6. These
     * are classified as proposals on the ES wiki:
     *   http://wiki.ecmascript.org/doku.php?id=harmony:proposals
     */
    harmony: 'harmony',

    /**
     * For features that are not yet on the ES wiki
     */
    experimental: 'experimental'
  };

  var kindMapping = Object.create(null);
  Object.keys(Kind).forEach(function(kind) {
    kindMapping[kind] = Object.create(null);
  });

  function enable(kind, b) {
    Object.keys(kindMapping[kind]).forEach(function(name) {
      options[name] = b;
    });
  }

  function getValue(kind) {
    var value;
    Object.keys(kindMapping[kind]).every(function(name) {
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

  var parseOptions = Object.create(null);
  var transformOptions = Object.create(null);
  var defaultValues = Object.create(null);

  /**
   * The options object.
   */
  var options = {
    /**
     * Meta option. Sets all options that are of Kind.es6
     * When getting this will return null if not all options of this kind
     * have the same value.
     * @type {boolean|null}
     */
    set es6(v) {
      enable(Kind.es6, Boolean(v));
    },
    get es6() {
      return getValue(Kind.es6);
    },

    /**
     * Meta option. Sets all options that are of Kind.harmony
     * When getting this will return null if not all options of this kind
     * have the same value.
     * @type {boolean|null}
     */
    set harmony(v) {
      enable(Kind.harmony, Boolean(v));
    },
    get harmony() {
      return getValue(Kind.harmony);
    },

    /**
     * Meta option. Sets all options that are of Kind.experimental
     * When getting this will return null if not all options of this kind
     * have the same value.
     * @type {boolean|null}
     */
    set experimental(v) {
      enable(Kind.experimental, Boolean(v));
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
    Object.keys(options).forEach(function(name) {
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
    Object.keys(object).forEach(function(name) {
      options[name] = object[name];
    });
  }

  // Make sure non option fields are non enumerable.
  Object.defineProperties(options, {
    parse: {value: parseOptions},
    transform: {value: transformOptions},
    reset: {value: reset},
    fromString: {value :fromString},
    fromArgv: {value :fromArgv},
    setFromObject: {value :setFromObject}
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
    var re = /--([^=]+)(?:=(.+))?/
    var m = re.exec(s);
    if (m) {
      var name = toCamelCase(m[1]);
      var value;
      switch (m[2]) {
        case '':
          value = true;
          break;
        case 'false':
          value = false;
          break;
        case 'parse':
          value = 'parse';
          break;
        default:
          value = true;
      }
      if (name in options) {
        options[name] = value;
      } else {
        throw Error('Unknown option: ' + m[1]);
      }
    }
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

  addFeatureOption('arrowFunctions', Kind.es6);
  addFeatureOption('blockBinding', Kind.es6);
  addFeatureOption('classes', Kind.es6);
  addFeatureOption('defaultParameters', Kind.es6);
  addFeatureOption('destructuring', Kind.es6);
  addFeatureOption('isExpression', Kind.es6);
  addFeatureOption('propertyMethods', Kind.es6);
  addFeatureOption('propertyNameShorthand', Kind.es6);
  addFeatureOption('quasi', Kind.es6);
  addFeatureOption('restParameters', Kind.es6);
  addFeatureOption('spread', Kind.es6);

  addFeatureOption('arrayComprehension', Kind.harmony);
  addFeatureOption('forOf', Kind.harmony);
  addFeatureOption('generatorComprehension', Kind.harmony);
  addFeatureOption('generators', Kind.harmony);
  addFeatureOption('modules', Kind.harmony);
  addFeatureOption('privateNameSyntax', Kind.harmony);
  addFeatureOption('privateNames', Kind.harmony);

  addFeatureOption('cascadeExpression', Kind.experimental);
  addFeatureOption('collections', Kind.experimental);
  addFeatureOption('deferredFunctions', Kind.experimental);
  addFeatureOption('propertyOptionalComma', Kind.experimental);

  addBoolOption('debug');
  addBoolOption('sourceMaps');
  addBoolOption('freeVariableChecker');
  addBoolOption('validate');

  traceur.options = options;
})();

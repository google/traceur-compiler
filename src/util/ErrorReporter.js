// Copyright 2011 Google Inc.
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

traceur.define('util', function() {
  'use strict';

  /**
   * A conduit for reporting errors and warnings to the user using the Firebug
   * console API.
   */
  function ErrorReporter() {}

  ErrorReporter.prototype = {
    hadError_: false,

    /**
     * @param {traceur.util.SourcePosition} location
     * @param {string} format
     */
    reportError: function(location, format, var_args) {
      this.hadError_ = true;
      var args = Array.prototype.slice.call(arguments, 2);
      this.reportMessageInternal(location, 'error', format, args);
    },

    /**
     * @param {traceur.util.SourcePosition} location
     * @param {string} format
     */
    reportWarning: function(location, format, var_args) {
      var args = Array.prototype.slice.call(arguments, 2);
      this.reportMessageInternal(location, 'warn', format, args);
    },

    /**
     * @param {traceur.util.SourcePosition} location
     * @param {string} kind
     * @param {string} format
     * @param {Array} args
     */
    reportMessageInternal: function(location, kind, format, args) {
      if (location)
        format = location + ': ' + format;
      console[kind].apply(console, [format].concat(args));
    },

    hadError: function() {
      return this.hadError_;
    },

    clearError: function() {
      this.hadError_ = false;
    }
  };

  /**
   * Formats an error message.
   * @param  {SourcePosition} location If present the source position is
   *     prepended to the message. Use |null| to not include the source
   *     position.
   * @param  {string} text The text to output. %s and %% are the only supported
   *     place holders.
   * @param  {Array} opt_args Array values to populate the placeholders with.
   * @return {string} The text where the source position has been prepended and
   *     where the place holders have been replaced.
   */
  ErrorReporter.format = function(location, text, opt_args) {
    var i = 0;
    text = text.replace(/%./g, function(s) {
      switch (s) {
        case '%s':
          return opt_args && opt_args[i++];
        case '%%':
          return '%';
      }
      return s;
    });
    if (location)
      text = location + ': ' + text;
    return text;
  };

  return {
    ErrorReporter: ErrorReporter
  };
});

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
   * Builds strings by appending them.
   * @constructor
   */
  function StringBuilder() {
    this.strings_ = [];
    this.length = 0;
  }

  StringBuilder.prototype = {
    append: function(str) {
      str = str.toString();
      this.length += str.length;
      this.strings_.push(str);
      return this;
    },

    toString: function() {
      return this.strings_.join('');
    },

    // Instead of supporting charAt and deleteCharAt, implement lastChar and
    // deleteLastChar. These can be implemented in constant time with no
    // additional data structures

    lastChar: function() {
      var last = this.strings_[this.strings_.length - 1];
      if (last) {
        last = last[last.length - 1];
      }
      return last;
    },

    deleteLastChar: function() {
      var lastString = this.strings_.length - 1;
      var last = this.strings_[lastString];
      if (last) {
        this.strings_[lastString] = last.substring(0, last.length - 1);
      }
    }
  };

  return {
    StringBuilder: StringBuilder
  };
});

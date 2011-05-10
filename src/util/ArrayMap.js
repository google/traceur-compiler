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
   * A map backed by arrays. All methods are O(n) so only use this when you
   * cannot change the key object.
   */
  function ArrayMap() {
    this.values_ = [];
    this.keys_ = [];
  }

  ArrayMap.prototype = {
    has: function(key) {
      return this.keys_.indexOf(key) != -1;
    },
    get: function(key) {
      var index = this.keys_.indexOf(key);
      if (index == -1) {
        return undefined;
      }
      return this.values_[index];
    },
    put: function(key, value) {
      var index = this.keys_.indexOf(key);
      if (index == -1) {
        this.keys_.push(key);
        this.values_.push(value);
      } else {
        this.values_[index] = value;
      }
    },
    addAll: function(other) {
      var keys = other.keys();
      var values = other.values();
      for (var i = 0; i < keys.length; i++) {
        this.put(keys[i], values[i]);
      }
    },
    remove: function(key) {
      var index = this.keys_.indexOf(key);
      if (index == -1) {
        return;
      }
      this.keys_.splice(index, 1);
      this.values_.splice(index, 1);
    },
    keys: function() {
      return this.keys_.concat();
    },
    values: function() {
      return this.values_.concat();
    }
  };

  return {
    ArrayMap: ArrayMap
  };
});

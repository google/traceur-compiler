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
   * A simple O(1) object map. It requires that the key object have a
   * {@code uid} property.
   */
  function ObjectMap() {
    this.keys_ = Object.create(null);
    this.values_ = Object.create(null);
  }

  ObjectMap.prototype = {
    put: function(key, value) {
      var uid = key.uid;
      this.keys_[uid] = key;
      this.values_[uid] = value;
    },
    get: function(key) {
      return this.values_[key.uid];
    },
    containsKey: function(key) {
      return key.uid in this.keys_;
    },
    addAll: function(other) {
      for (var uid in other.keys_) {
        this.keys_[uid] = other.keys_[uid];
        this.values_[uid] = other.values_[uid];
      }
    },
    keys: function() {
      return Object.keys(this.keys_).map(function(uid) {
        return this.keys_[uid];
      }, this);
    },
    values: function() {
      return Object.keys(this.values_).map(function(uid) {
        return this.values_[uid];
      }, this);
    },
    remove: function(key) {
      var uid = key.uid;
      delete this.keys_[uid];
      delete this.values_[uid];
    }
  };

  return {
    ObjectMap: ObjectMap
  };
});

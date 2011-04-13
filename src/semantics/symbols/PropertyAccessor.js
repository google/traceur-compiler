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

traceur.define('semantics.symbols', function() {
  'use strict';

  /**
   * A get or set accessor for a property.
   *
   * @param {PropertySymbol} property
   * @constructor
   */
  function PropertyAccessor(property) {
    this.property = property;
  }

  PropertyAccessor.prototype = {
    /**
     * @return {string}
     */
    getName: function() {
      return this.property.name;
    },

    /**
     * @return {AggregateSymbol}
     */
    getContainingAggregate: function() {
      return this.property.containingAggregate;
    },

    /**
     * @return {boolean}
     */
    isStatic: function() {
      return this.property.isStatic;
    }
  };

  return {
    PropertyAccessor: PropertyAccessor
  };
});

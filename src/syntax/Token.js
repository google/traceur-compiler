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

traceur.define('syntax', function() {
  'use strict';

  var assert = traceur.assert;

  /**
   * A Token in a javascript file.
   * Immutable.
   * A plain old data structure. Should contain data members and simple
   * accessors only.
   * @param {traceur.syntax.TokenType} type
   * @param {traceur.util.SourceRange} location
   * @constructor
   */
  function Token(type, location) {
    this.type = type;
    this.location = location;
  }

  Token.prototype = {
    /** @return {traceur.util.SourcePosition} */
    getStart: function() {
      return this.location.start;
    },

    toString: function() {
      return this.type.toString();
    },

    /** @return {traceur.syntax.IdentifierToken} */
    asIdentifier: function() {
      assert(this instanceof traceur.syntax.IdentifierToken);
      return this;
    },

    /** @return {traceur.syntax.LiteralToken} */
    asLiteral: function() {
      assert(this instanceof traceur.syntax.LiteralToken);
      return this;
    }
  };

  // Export
  return {
    Token: Token
  };
});

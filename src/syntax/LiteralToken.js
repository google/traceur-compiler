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


/**
 * A token representing a javascript literal. Includes string, regexp, and
 * number literals. Boolean and null literals are represented as regular keyword
 * tokens.
 *
 * The value just includes the raw lexeme. For string literals it includes the
 * begining and ending delimiters.
 *
 * TODO: Regexp literals should have their own token type.
 * TODO: A way to get the processed value, rather than the raw value.
 */
traceur.define('syntax', function() {
  'use strict';

  var Token = traceur.syntax.Token;

  /**
   * @param {traceur.syntax.TokenType} type
   * @param {string} value
   * @param {traceur.util.SourceRange} location
   * @constructor
   * @extends {Token}
   */
  function LiteralToken(type, value, location) {
    Token.call(this, type, location);
    this.value = value;
  }

  LiteralToken.prototype = {
    __proto__: Token.prototype,
    toString: function() {
      return this.value;
    }
  };

  return {
    LiteralToken: LiteralToken
  };
});

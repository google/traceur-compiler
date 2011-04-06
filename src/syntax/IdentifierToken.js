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

  var Token = traceur.syntax.Token;
  var TokenType = traceur.syntax.TokenType;

  /**
   * A token representing an identifier.
   * @param {traceur.util.SourceRange} location
   * @param {string} value
   * @constructor
   * @extends {Token}
   */
  function IdentifierToken(location, value) {
    Token.call(this, TokenType.IDENTIFIER, location);
    this.value = value;
  }

  IdentifierToken.prototype = {
    __proto__: Token.prototype,
    toString: function() {
      return this.value;
    }
  };

  return {
    IdentifierToken: IdentifierToken
  };
});

// Copyright 2011 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

traceur.define('syntax', function() {
  'use strict';

  var TokenType = traceur.syntax.TokenType;

  /**
   * The javascript keywords.
   */
  var keywords = [
    // 7.6.1.1 Keywords
    'break',
    'case',
    'catch',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'finally',
    'for',
    'function',
    'if',
    'in',
    'instanceof',
    'new',
    'return',
    'switch',
    'this',
    'throw',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',

    // 7.6.1.2 Future Reserved Words
    'class',
    'const',
    'enum',
    'export',
    'extends',
    'import',
    'super',

    // Future Reserved Words in a strict context
    'implements',
    'interface',
    'let',
    'package',
    'private',
    'protected',
    'public',
    'static',
    'yield',

    // 7.8 Literals
    'null',
    'true',
    'false',

    // Traceur Specific
    'await'
  ];

  var Keywords = { };

  var keywordsByName = Object.create(null);
  var keywordsByType = Object.create(null);

  function Keyword(value, type) {
    this.value = value;
    this.type = type;
  }
  Keyword.prototype = {
    toString: function() {
      return this.value;
    }
  };

  keywords.forEach(function(value) {
    var uc = value.toUpperCase();
    if (uc.indexOf('__') === 0) {
      uc = uc.substring(2);
    }

    var kw = new Keyword(value, TokenType[uc]);

    Keywords[uc] = kw;
    keywordsByName[kw.value] = kw;
    keywordsByType[kw.type] = kw;
  });

  Keywords.isKeyword = function(value) {
    return value !== '__proto__' && value in keywordsByName;
  };

  /**
   * @return {TokenType}
   */
  Keywords.getTokenType = function(value) {
    if (value == '__proto__')
      return null;
    return keywordsByName[value].type;
  };

  Keywords.get = function(value) {
    if (value == '__proto__')
      return null;
    return keywordsByName[value];
  };

  //Keywords.get = function(TokenType token) {
  //  return keywordsByType.get(token);
  //}

  // Export
  return {
    Keywords: Keywords
  };
});

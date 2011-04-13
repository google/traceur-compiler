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

  // 7.5 Tokens
  /**
   * @enum {string}
   */
  var TokenType = {
    END_OF_FILE: 'End of File',
    ERROR: 'error',

    // 7.6 Identifier Names and Identifiers
    IDENTIFIER: 'identifier',

    // 7.6.1.1 keywords
    BREAK: 'break',
    CASE: 'case',
    CATCH: 'catch',
    CONTINUE: 'continue',
    DEBUGGER: 'debugger',
    DEFAULT: 'default',
    DELETE: 'delete',
    DO: 'do',
    ELSE: 'else',
    FINALLY: 'finally',
    FOR: 'for',
    FUNCTION: 'function',
    IF: 'if',
    IN: 'in',
    INSTANCEOF: 'instanceof',
    NEW: 'new',
    RETURN: 'return',
    SWITCH: 'switch',
    THIS: 'this',
    THROW: 'throw',
    TRY: 'try',
    TYPEOF: 'typeof',
    VAR: 'var',
    VOID: 'void',
    WHILE: 'while',
    WITH: 'with',

    // 7.6.1.2 Future reserved words
    CLASS: 'class',
    CONST: 'const',
    ENUM: 'enum',
    EXPORT: 'export',
    EXTENDS: 'extends',
    IMPORT: 'import',
    SUPER: 'super',

    // Future reserved words in strict mode
    IMPLEMENTS: 'implements',
    INTERFACE: 'interface',
    LET: 'let',
    PACKAGE: 'package',
    PRIVATE: 'private',
    PROTECTED: 'protected',
    PUBLIC: 'public',
    STATIC: 'static',
    YIELD: 'yield',

    // 7.7 Punctuators
    OPEN_CURLY: '{',
    CLOSE_CURLY: '}',
    OPEN_PAREN: '(',
    CLOSE_PAREN: ')',
    OPEN_SQUARE: '[',
    CLOSE_SQUARE: ']',
    PERIOD: '.',
    SEMI_COLON: ';',
    COMMA: ',',
    OPEN_ANGLE: '<',
    CLOSE_ANGLE: '>',
    LESS_EQUAL: '<=',
    GREATER_EQUAL: '>=',
    EQUAL_EQUAL: '==',
    NOT_EQUAL: '!=',
    EQUAL_EQUAL_EQUAL: '===',
    NOT_EQUAL_EQUAL: '!==',
    PLUS: '+',
    MINUS: '-',
    STAR: '*',
    PERCENT: '%',
    PLUS_PLUS: '++',
    MINUS_MINUS: '--',
    LEFT_SHIFT: '<<',
    RIGHT_SHIFT: '>>',
    UNSIGNED_RIGHT_SHIFT: '>>>',
    AMPERSAND: '&',
    BAR: '|',
    CARET: '^',
    BANG: '!',
    TILDE: '~',
    AND: '&&',
    OR: '||',
    QUESTION: '?',
    COLON: ':',
    EQUAL: '=',
    PLUS_EQUAL: '+=',
    MINUS_EQUAL: '-=',
    STAR_EQUAL: '*=',
    PERCENT_EQUAL: '%=',
    LEFT_SHIFT_EQUAL: '<<=',
    RIGHT_SHIFT_EQUAL: '>>=',
    UNSIGNED_RIGHT_SHIFT_EQUAL: '>>>=',
    AMPERSAND_EQUAL: '&=',
    BAR_EQUAL: '|=',
    CARET_EQUAL: '^=',
    SLASH: '/',
    SLASH_EQUAL: '/=',
    POUND: '#',

    // 7.8 Literals
    NULL: 'null',
    TRUE: 'true',
    FALSE: 'false',
    NUMBER: 'number literal',
    STRING: 'string literal',
    REGULAR_EXPRESSION: 'regular expression literal',

    // Harmony extensions
    SPREAD: '...',
    AWAIT: 'await'
  };

  return {
    TokenType: TokenType
  };
});

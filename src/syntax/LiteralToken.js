// Copyright 2012 Traceur Authors.
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
 */

import {Token} from './Token';
import {
  NULL,
  NUMBER,
  STRING
} from './TokenType';

/**
 * Helper class for getting the processed value out of a string literal token.
 * This returns the value of the string and not the string as it was entered in
 * the source code.
 */
class StringParser {
  /**
   * @param {string} value
   */
  constructor(value) {
    this.value = value;
    this.index = 0;  // value is wrapped in " or '
  }

  [Symbol.iterator]() {
    return this;
  }

  next() {
    if (++this.index >= this.value.length - 1)
      return {value: undefined, done: true};

    return {value: this.value[this.index], done: false};
  }

  parse() {
    // If there are no escape sequences we can just return the contents of the
    // string.
    if (this.value.indexOf('\\') === -1)
      return this.value.slice(1, -1);

    var result = '';

    for (var ch of this) {
      result += ch === '\\' ? this.parseEscapeSequence() : ch;
    }

    return result;
  }

  parseEscapeSequence() {
    var ch = this.next();
    switch (ch) {
      case '\n':  // <LF>
      case '\r':  // <CR>
      case '\u2028':  // <LS>
      case '\u2029':  // <PS>
        return '';
      case '0':
        return '\0';
      case 'b':
        return '\b';
      case 'f':
        return '\f';
      case 'n':
        return '\n';
      case 'r':
        return '\r';
      case 't':
        return '\t';
      case 'v':
        return '\v';
      case 'x':
        // 2 hex digits
        return String.fromCharCode(parseInt(this.next() + this.next(), 16));
      case 'u':
        // 4 hex digits
        return String.fromCharCode(parseInt(this.next() + this.next() +
                                            this.next() + this.next(), 16));
      default:
        if (Number(ch) < 8)
          throw new Error('Octal literals are not supported');
        return ch;
    }
  }
}

export class LiteralToken extends Token {
  /**
   * @param {TokenType} type
   * @param {string} value
   * @param {SourceRange} location
   */
  constructor(type, value, location) {
    this.type = type;
    this.location = location;
    this.value = value;
  }

  toString() {
    return this.value;
  }

  /**
   * The value this literal token represents. For example, for string literals
   * it is the value of the string and not the character sequence in the string
   * literal.
   * @type {Null|number|string}
   */
  get processedValue() {
    switch (this.type) {
      case NULL:
        return null;

      case NUMBER:
        var value = this.value;
        if (value.charCodeAt(0) === 48) {  // 0
          switch (value.charCodeAt(1)) {
            case 66:  // B
            case 98:  // b
              return parseInt(this.value.slice(2), 2);
            case 79:  // O
            case 111:  // o
              return parseInt(this.value.slice(2), 8);
          }
        }
        return Number(this.value);

      case STRING:
        var parser = new StringParser(this.value);
        return parser.parse();

      default:
        throw new Error('Not implemented');
    }
  }
}

// Copyright 2012 Google Inc.
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

import TokenType from 'TokenType.js';

/**
 * A Token in a javascript file.
 * Immutable.
 * A plain old data structure. Should contain data members and simple
 * accessors only.
 */
export class Token {
  /**
   * @param {TokenType} type
   * @param {SourceRange} location
   */
  constructor(type, location) {
    this.type = type;
    this.location = location;
  }

  toString() {
    return this.type.toString();
  }

  /** @return {boolean} */
  isAssignmentOperator() {
    switch (this.type) {
      case TokenType.EQUAL:
      case TokenType.STAR_EQUAL:
      case TokenType.SLASH_EQUAL:
      case TokenType.PERCENT_EQUAL:
      case TokenType.PLUS_EQUAL:
      case TokenType.MINUS_EQUAL:
      case TokenType.LEFT_SHIFT_EQUAL:
      case TokenType.RIGHT_SHIFT_EQUAL:
      case TokenType.UNSIGNED_RIGHT_SHIFT_EQUAL:
      case TokenType.AMPERSAND_EQUAL:
      case TokenType.CARET_EQUAL:
      case TokenType.BAR_EQUAL:
        return true;
      default:
        return false;
    }
  }

  isKeyword() {
    return false;
  }
}

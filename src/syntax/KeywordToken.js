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

import Token from 'Token.js';

export class KeywordToken extends Token {
  /**
   * @param {TokenType} type
   * @param {SourceRange} location
   */
  constructor(type, location) {
    this.type = type;
    this.location = location;
  }

  isKeyword() {
    return true;
  }
}

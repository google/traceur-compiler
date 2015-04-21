// Copyright 2011 Traceur Authors.
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

import {suite, test, assert} from '../../unit/unitTestRunner.js';
import * as TokenType from '../../../src/syntax/TokenType.js';
import {LiteralToken} from '../../../src/syntax/LiteralToken.js';

suite('LiteralToken.js', function() {

  test('Decode newline', function() {
    var token = new LiteralToken(TokenType.STRING, '"hello\nworld"');
    assert.equal(token.processedValue, "hello\nworld");

  });

  test('Decode hex escape', function() {
    var token = new LiteralToken(TokenType.STRING, '"\x21\"');
    assert.equal(token.processedValue, "!");
  });

  test('Decode unicode escape', function() {
    var token = new LiteralToken(TokenType.STRING, '"\u2713"');
    assert.equal(token.processedValue, "✓");
  });

});
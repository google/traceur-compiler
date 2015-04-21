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

import {IdentifierToken} from '../../../src/syntax/IdentifierToken.js';
import {LiteralToken} from '../../../src/syntax/LiteralToken.js';
import {Token} from '../../../src/syntax/Token.js';
import * as TokenType from '../../../src/syntax/TokenType.js';

suite('Token.js', function() {

  test('Token', function() {
    var token = new Token('type', 'location');
    assert.equal('type', token.type);
    assert.equal('location', token.location);
  });

  test('TokenType', function() {
    assert.equal('=', TokenType.EQUAL);
  });

  test('LiteralToken', function() {
    var token = new LiteralToken('type', 'value', 'location');
    assert.equal('type', token.type);
    assert.equal('value', token.value);
    assert.equal('location', token.location);
  });

  test('IdentifierToken', function() {
    var token = new IdentifierToken('location', 'id');
    assert.equal('identifier', token.type);
    assert.equal('id', token.value);
    assert.equal('location', token.location);
  });

});

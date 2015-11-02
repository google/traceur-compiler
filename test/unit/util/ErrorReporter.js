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

import {
  suite,
  test,
  assert,
  setup,
  teardown
} from '../../unit/unitTestRunner.js';

import {ErrorReporter} from '../../../src/util/ErrorReporter.js';
import {MultipleErrors} from '../../../src/util/CollectingErrorReporter.js';
import {MutedErrorReporter} from '../../../src/util/MutedErrorReporter.js';
import {SourceFile} from '../../../src/syntax/SourceFile.js'
import {SourcePosition} from '../../../src/util/SourcePosition.js';
import {SourceRange} from '../../../src/util/SourceRange.js';
import {SyntaxErrorReporter} from '../../../src/util/SyntaxErrorReporter.js';

suite('ErrorReporter.js', function() {

  var originalConsoleError = console.error;
  var args;

  setup(function() {
    args = [];
    console.error = function() {
      args.push(arguments);
    };
  });

  teardown(function tearDown() {
    console.error = originalConsoleError;
    args = undefined;
  });

  test('ErrorReporter', function() {
    var r = new ErrorReporter();

    r.reportError(null, 'abcde');

    assert.equal(args.length, 1);
    assert.equal(args[0][0], 'abcde');
  });

  test('ErrorReporterWithLocation', function() {
    var r = new ErrorReporter();
    var file = new SourceFile('test.js', '');
    var start = new SourcePosition(file, 1);
    start.line_ = 2;
    start.column_ = 3;
    var end = new SourcePosition(file, 1);
    end.line_ = 2;
    end.column_ = 4;

    var location = new SourceRange(start, end);
    r.reportError(location, 'abcde');

    assert.equal(args.length, 1);
    assert.equal(args[0][0], 'test.js:3:4: abcde');
  });

  test('MutedErrorReporter', function() {
    var r = new MutedErrorReporter();
    r.reportError(null, 'a%sc%se', 'b', 'd');
    assert.equal(args.length, 0);
  });

  test('SyntaxErrorReporter', function() {
    var r = new SyntaxErrorReporter();
    var thrown;
    try {
      r.reportError(null, 'abcde');
    } catch(syntaxError) {
      thrown = syntaxError;
    } finally {
      assert(thrown);
      assert.equal('SyntaxError: abcde', thrown + '');
    }
  });

  test('MultipleErrors', function() {
    var accumulated = [new SyntaxError('one'), new SyntaxError('two')];
    var error = new MultipleErrors(accumulated);
    assert.throws(function() {
      throw error;
    }, MultipleErrors);
    assert.equal(error + '', 'MultipleErrors: ' + accumulated.join('\n'));
  });

  test('Only one MultipleErrors', function() {
    var accumulated = [new SyntaxError('one')];
    var error = new MultipleErrors(accumulated);
    assert.throws(function() {
      throw error;
    }, MultipleErrors);
    assert.equal(error + '', 'MultipleErrors: ' + accumulated.join('\n'));

  });

  test('No MultipleErrors', function() {
    var accumulated = [];
    var error = new MultipleErrors(accumulated);
    assert.throws(function() {
      throw error;
    }, MultipleErrors);
    assert.equal(error + '', 'MultipleErrors');
  });

  test('Format', function() {
    var  format = ErrorReporter.format;
    assert.equal('loc: msg', format('loc', 'msg'));
    assert.equal('msg', format(null, 'msg'));

    assert.equal('1 + 2 = 3', format(null, '%s + %s = %s', [1, 2, 3]));
    assert.equal('a % b', format(null, 'a % b'));
    assert.equal('a % b', format(null, 'a %% b'));
    assert.equal('%', format(null, '%%'));
    assert.equal('%%', format(null, '%%%'));
    assert.equal('%%', format(null, '%%%%'));
    assert.equal('%%%', format(null, '%%%%%'));

    assert.equal('undefined', format(null, '%s'));
  });

  test('DevtoolsLink', function() {
    if (typeof window === 'undefined')
      return;

    var file = new SourceFile('error_reporter_test.html', '');
    var location = new SourcePosition(file, 1);
    location.line_ = 108;
    location.column_ = 3;

    var segments = window.location.href.split('/');
    segments.pop();
    segments.push(location.toString());
    var linkable = segments.join('/');
    console.log('click on this link in devtools console: ' + linkable + '  ');
  });

});

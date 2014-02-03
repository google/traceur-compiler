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

suite('parser.js', function() {
  var errorReporter = {
    reportError: function(position, message) {
      throw new chai.AssertionError({message: message + ', ' + position});
    }
  };

  teardown(function() {
    traceur.options.reset();
  });

  test('Module', function() {
    var program = 'export var x = 42;\n' +
                  'module M from \'url\';\n' +
                  'import {z} from \'x\';\n' +
                  'import {a as b, c} from \'M\';\n';
    var sourceFile = new traceur.syntax.SourceFile('Name', program);
    var parser = new traceur.syntax.Parser(sourceFile, errorReporter);

    parser.parseModule();
  });

  test('handleComment', function() {
    traceur.options.commentCallback = true;

    var program = '// AAA\n' +
                  'var b = \'c\';\n' +
                  '/* DDD */ function e() {}\n';
    var sourceFile = new traceur.syntax.SourceFile('Name', program);
    var parser = new traceur.syntax.Parser(sourceFile, errorReporter);
    var comments = [];
    parser.handleComment = function(sourceRange) {
      comments.push(sourceRange);
    };
    parser.parseScript();

    assert.equal(comments.length, 2);

    assert.equal(comments[0].start.offset, 0);
    assert.equal(comments[0].end.offset, 7);
    assert.equal(comments[0].toString(), '// AAA\n');

    assert.equal(comments[1].start.line, 2);
    assert.equal(comments[1].start.column, 0);
    assert.equal(comments[1].end.line, 2);
    assert.equal(comments[1].end.column, 9);
    assert.equal(comments[1].toString(), '/* DDD */');
  });

});

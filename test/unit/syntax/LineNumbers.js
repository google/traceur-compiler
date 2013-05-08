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

suite('LineNumbers.js', function() {

  test('lineNumbers', function() {

    var src = 'function foo() { return 5; }\nvar \nf\n=\n5\n;\n';

    var filename = 'checkLineNumbers.js';
    var sourceFile = new traceur.syntax.SourceFile(filename, src);
    var lineNumberTable = sourceFile.lineNumberTable;

    var lastLine = lineNumberTable.getLine(sourceFile.contents.length - 1);
    assert.equal(lastLine, 5);

    var resource = '';
    for (var line = 0; line <= lastLine; line++) {
      var offset = lineNumberTable.offsetOfLine(line);
      var column = lineNumberTable.getColumn(offset);
      var lineOut = lineNumberTable.getLine(offset);
      assert.equal(lineOut, line);
      assert.equal(column, 0);  // check non-zero value below
      var nextOffset = lineNumberTable.offsetOfLine(line + 1);
      var maxOffset = sourceFile.contents.length;
      nextOffset = nextOffset > maxOffset ? maxOffset : nextOffset;
      resource += sourceFile.contents.substring(offset, nextOffset);
    }

    assert.equal(src, resource);

    // verify one non-zero column
    assert.equal(lineNumberTable.getColumn(31), 2);

    var outOfBounds = lineNumberTable.getLine(-640);
    assert.equal(outOfBounds, 0);
    var inBounds = lineNumberTable.getLine(6);
    assert.equal(inBounds, 0);
  });

});
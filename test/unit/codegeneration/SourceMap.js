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

suite('SourceMap.js', function() {
  var SourceMapConsumer = traceur.outputgeneration.SourceMapConsumer;
  var SourceMapGenerator = traceur.outputgeneration.SourceMapGenerator;
  var TreeWriter = traceur.outputgeneration.TreeWriter;

  var errorReporter = {
    reportError: function(position, message) {
      console.error(message + ', ' + position);
    }
  };

  function parse(name, source) {
    var sourceFile = new traceur.syntax.SourceFile(name, source);
    var parser = new traceur.syntax.Parser(sourceFile, errorReporter);
    var tree = parser.parseScript();
    return tree;
  }

  test('SourceMap', function() {
    var src = 'function foo() { return 5; }\nvar \nf\n=\n5\n;\n';

    var filename = 'sourceMapThis.js';
    var tree = parse(filename, src);

    var testcases = [
      {generated: {line: 1, column: 0}, original: {line: 1, column: 0}},
      {generated: {line: 2, column: 0}, original: {line: 1, column: 17}},
      {generated: {line: 3, column: 0}, original: {line: 1, column: 24}},
      {generated: {line: 4, column: 0}, original: {line: 3, column: 0}},
      {generated: {line: 5, column: 0}, original: {line: 6, column: 0}}
    ];

    var generator = new SourceMapGenerator({file: filename});
    var options = {sourceMapGenerator: generator, showLineNumbers: false};
    var actual = TreeWriter.write(tree, options);

    var consumer = new SourceMapConsumer(options.sourceMap);

    testcases.forEach(function(testcase, caseNumber) {
      var actual = consumer.originalPositionFor(testcase.generated);
      var shouldBeTrue = actual.line === testcase.original.line;
      assert.isTrue(shouldBeTrue, caseNumber + ' Line mismatch ' + actual.line);
      shouldBeTrue = actual.column === testcase.original.column;
      assert.isTrue(shouldBeTrue,
                    caseNumber + ' Column mismatch ' + actual.column);
    });

    var sourceContent = consumer.sourceContentFor(filename);
    assert.equal(sourceContent, src);
  });

  test('MultipleFiles', function() {
    var treeA = parse('a.js', 'alert(a);');
    var treeB = parse('b.js', 'alert(b);');
    var treeC = parse('c.js', 'alert(c);');

    // Now create a new program that contains these 3.
    var push = [].push.apply.bind([].push);
    var newProgramElements = [];
    push(newProgramElements, treeA.scriptItemList);
    push(newProgramElements, treeB.scriptItemList);
    push(newProgramElements, treeC.scriptItemList);
    var tree = new traceur.syntax.trees.Script(null, newProgramElements);

    var outFilename = 'out.js'
    var generator = new SourceMapGenerator({file: outFilename});
    var options = {sourceMapGenerator: generator};
    var outFileContents = TreeWriter.write(tree, options);

    assert.equal('alert(a);\nalert(b);\nalert(c);\n', outFileContents);

    var map = JSON.parse(options.sourceMap);
    assert.equal(outFilename, map.file);
    assertArrayEquals(['a.js', 'b.js', 'c.js'], map.sources);
  });

  test('ImportSpecifierSetSourceMap', function() {
    var src = "  import {x} from 'WrapNewObjectTransformer';";

    var filename = 'sourceMapImportSpecifierSet.js';
    var tree = parse(filename, src);

    var generator = new SourceMapGenerator({file: filename});
    var options = {sourceMapGenerator: generator, showLineNumbers: false};
    var actual = TreeWriter.write(tree, options);

    var consumer = new SourceMapConsumer(options.sourceMap);

    var sourceContent = consumer.sourceContentFor(filename);
    assert.equal(sourceContent, src);
  });

});
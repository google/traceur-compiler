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

  function get(name) {
    return $traceurRuntime.ModuleStore.getForTesting(name);
  }

  var Parser = get('src/syntax/Parser').Parser;
  var SourceFile = get('src/syntax/SourceFile').SourceFile;
  var SourceMapConsumer = get('src/outputgeneration/SourceMapIntegration').SourceMapConsumer;
  var SourceMapGenerator = get('src/outputgeneration/SourceMapIntegration').SourceMapGenerator;
  var write = get('src/outputgeneration/TreeWriter').write;

  var errorReporter = {
    reportError: function(position, message) {
      console.error(message + ', ' + position);
    }
  };

  function parse(name, source) {
    var sourceFile = new SourceFile(name, source);
    var parser = new Parser(sourceFile, errorReporter);
    var tree = parser.parseScript();
    return tree;
  }

  function parseModule(name, source) {
    var sourceFile = new SourceFile(name, source);
    var parser = new Parser(sourceFile, errorReporter);
    var tree = parser.parseModule();
    return tree;
  }

  test('relativeToSource', function() {
    var relativeToSourceRoot =
        get('src/outputgeneration/ParseTreeMapWriter').relativeToSourceRoot;
    assert.equal(relativeToSourceRoot('@foo', '/w/t/out/'), '@foo',
        '@ names are unchanged');

    assert.equal(relativeToSourceRoot('/w/t/src/foo.js', '/w/t/out/'), '../src/foo.js',
        'relative to sourceRoot in /out');

    assert.equal(relativeToSourceRoot('/w/t/src/bar/foo.js', '/w/t/out/'),
        '../src/bar/foo.js', 'deeper left side');

    assert.equal(relativeToSourceRoot('/w/t/src/bar/foo.js', '/w/t/out/baz/'),
        '../../src/bar/foo.js', 'deeper both side');

    assert.equal(relativeToSourceRoot('/w/t/src/foo.js', '/w/t/src/'),
        'foo.js', 'same directory  ');

    assert.equal(relativeToSourceRoot('/w/t/src/foo.js', '/w/t/out'),
        '../src/foo.js', 'missing trailing slash');
  });

  test('SourceMap', function() {
    var src = 'function foo() { return 5; }\nvar \nf\n=\n5\n;\n';
    var srcLines = src.split('\n');
    var filename = 'sourceMapThis.js';
    var tree = parse(filename, src);

    var testcases = [
      // >f<unction
      {generated: {line: 1, column: 0}, original: {line: 1, column: 0}},
      // function foo() { >r<eturn 5; }
      {generated: {line: 2, column: 0}, original: {line: 1, column: 17}},
      // function foo() { return 5; >}<
      {generated: {line: 3, column: 0}, original: {line: 1, column: 27}},
      {generated: {line: 4, column: 0}, original: {line: 3, column: 0}},
      {generated: {line: 5, column: 1}, original: {line: 6, column: 0}}
    ];

    var generator = new SourceMapGenerator({file: filename});
    var options = {sourceMapGenerator: generator, showLineNumbers: false};
    var generatedSource = write(tree, options);
    var generatedLines = generatedSource.split('\n');

    // Check that the generated code did not change since we analyzed the map.
    var expectedFilledColumnsZeroThrough = [15, 10, 0, 9, 0, -1];
    generatedLines.map(function(line, index) {
      assert.equal(line.length - 1, expectedFilledColumnsZeroThrough[index]);
    });

    var consumer = new SourceMapConsumer(options.generatedSourceMap);
    testcases.forEach(function(testcase, caseNumber) {
      var actual = consumer.originalPositionFor(testcase.generated);
      var shouldBeTrue = actual.line === testcase.original.line;
      assert.isTrue(shouldBeTrue, caseNumber + ' Line mismatch ' + actual.line);
      var expected = testcase.original.column;
      shouldBeTrue = actual.column === expected;
      assert.isTrue(shouldBeTrue,
          caseNumber + ' Column mismatch ' + actual.column + ' vs ' + expected);
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
    var outFileContents = write(tree, options);

    assert.equal('alert(a);\nalert(b);\nalert(c);\n', outFileContents);

    var map = JSON.parse(options.generatedSourceMap);
    assert.equal(outFilename, map.file);
    assertArrayEquals(['a.js', 'b.js', 'c.js'], map.sources);
  });

  test('ImportSpecifierSetSourceMap', function() {
    var src = "  import {x} from 'WrapNewObjectTransformer';";

    var filename = 'sourceMapImportSpecifierSet.js';
    var tree = parseModule(filename, src);

    var generator = new SourceMapGenerator({file: filename});
    var options = {sourceMapGenerator: generator, showLineNumbers: false};
    var actual = write(tree, options);

    var consumer = new SourceMapConsumer(options.generatedSourceMap);

    var sourceContent = consumer.sourceContentFor(filename);
    assert.equal(sourceContent, src);
  });

});

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
} from '../../unit/unitTestRunner.js';

import {Compiler} from '../../../src/Compiler.js';
import {Parser} from '../../../src/syntax/Parser.js';
import {Script} from '../../../src/syntax/trees/ParseTrees.js';
import {SourceFile} from '../../../src/syntax/SourceFile.js';
import {SourceMapConsumer} from '../../../src/outputgeneration/SourceMapIntegration.js';
import {SourceMapGenerator} from '../../../src/outputgeneration/SourceMapIntegration.js';
import {relativePath} from '../../../src/outputgeneration/ParseTreeMapWriter.js';

suite('SourceMap.js', function() {

  var moduleCompiler = new Compiler({sourceMaps: 'file'});
  var scriptCompiler = new Compiler({sourceMaps: 'file', script: true});
  var scriptCompilerLowRes = new Compiler({sourceMaps: 'file', script: true,
                                           lowResolutionSourceMap: true});

  test('relativeToSource', function() {

    assert.equal(relativePath('@foo', '/w/t/out/'), '@foo',
        '@ names are unchanged');

    assert.equal(relativePath('/w/t/src/foo.js', '/w/t/out/'), '../src/foo.js',
        'relative to sourceRoot in /out');

    assert.equal(relativePath('/w/t/src/bar/foo.js', '/w/t/out/'),
        '../src/bar/foo.js', 'deeper left side');

    assert.equal(relativePath('/w/t/src/bar/foo.js', '/w/t/out/baz/'),
        '../../src/bar/foo.js', 'deeper both side');

    assert.equal(relativePath('/w/t/src/foo.js', '/w/t/src/'),
        'foo.js', 'same directory  ');

    assert.throws(() => relativePath('/w/t/src/foo.js', '/w/t/out'));

    assert.equal(relativePath('/w/t/t/w/c/d/s/js/greeting.js',
      '/w/t/t/w/c/d/d/js/'), '../../s/js/greeting.js', 'src/js bug');
  });

  test('SourceMap', function() {
    var src = 'function foo(a) { return 5; }\nvar \nf\n=\n5\n;\n';
    var filename = 'sourceMapThis.js';
    var tree = scriptCompiler.parse(src, filename);

    var generatedSource = scriptCompiler.write(tree, filename);
    var generatedLines = generatedSource.split('\n');

    // Check that the generated code did not change since we analyzed the map.
    var expectedFilledColumnsZeroThrough = [16, 10, 0, 9, 0, 40, -1];
    generatedLines.forEach(function(line, index) {
      assert.equal(line.length - 1, expectedFilledColumnsZeroThrough[index],
        'line ' + index + ', length mismatch ');
    });

    var consumer = new SourceMapConsumer(scriptCompiler.getSourceMap(filename));

    var testcases = [
      // >f<unction
      {generated: {line: 1, column: 0}, original: {line: 1, column: 0}},
      // function foo(>a<)
      {generated: {line: 1, column: 13}, original: {line: 1, column: 13}},
      // function foo(a) { >r<eturn 5; }
      {generated: {line: 2, column: 0}, original: {line: 1, column: 18}},
      // function foo(a) { return 5; >}<
      {generated: {line: 3, column: 0}, original: {line: 1, column: 28}},
      {generated: {line: 4, column: 0}, original: {line: 3, column: 0}},
      {generated: {line: 5, column: 1}, original: {line: 6, column: 0}}
    ];

    testcases.forEach(function(testcase, caseNumber) {
      var actual = consumer.originalPositionFor(testcase.generated);
      assert.strictEqual(actual.line, testcase.original.line);
      assert.strictEqual(actual.column, testcase.original.column);
    });

    var sourceContent = consumer.sourceContentFor(filename);
    assert.equal(sourceContent, src);
  });

  test('SourceMap with low resolution option', function() {
    var src = 'function foo(a) { return 5; }\nvar \nf\n=\n5\n;\n';
    var filename = 'sourceMapThis.js';
    var tree = scriptCompilerLowRes.parse(src, filename);

    var generatedSource = scriptCompilerLowRes.write(tree, filename);
    var generatedLines = generatedSource.split('\n');

    // Check that the generated code did not change since we analyzed the map.
    var expectedFilledColumnsZeroThrough = [16, 10, 0, 9, 0, 40, -1];
    generatedLines.forEach(function(line, index) {
      assert.equal(line.length - 1, expectedFilledColumnsZeroThrough[index]);
    });

    var consumer = new SourceMapConsumer(scriptCompilerLowRes.getSourceMap(filename));

    var testcases = [
      // >f<unction
      {generated: {line: 1, column: 0}, original: {line: 1, column: 0}},
      // function foo(>a<)
      {generated: {line: 1, column: 13}, original: {line: 1, column: 0}},
      // function foo(a) { >r<eturn 5; }
      {generated: {line: 2, column: 0}, original: {line: 1, column: 18}},
      // function foo(a) { return 5; >}<
      {generated: {line: 3, column: 0}, original: {line: 1, column: 28}},
      {generated: {line: 4, column: 0}, original: {line: 1, column: 28}},
      {generated: {line: 5, column: 1}, original: {line: 6, column: 0}}
    ];

    testcases.forEach(function(testcase, caseNumber) {
      var actual = consumer.originalPositionFor(testcase.generated);
      assert.strictEqual(actual.line, testcase.original.line);
      assert.strictEqual(actual.column, testcase.original.column);
    });

    var sourceContent = consumer.sourceContentFor(filename);
    assert.equal(sourceContent, src);
  });

  test('SourceMap with input map', function() {
    var src = 'function foo() { return 5; }\nvar \nf\n=\n5\n;\n';
    var srcLines = src.split('\n');
    var filename = 'sourceMapThis.js';

    // maps every character one column right and two lines down
    var g = new SourceMapGenerator({file: 'sourceMapThis.js'});
    for (var i = 0; i < srcLines.length; i++) {
      for (var j = 0; j < srcLines[i].length; j++) {
        g.addMapping({
          generated: {line: i + 1, column: j},
          original: {line: i + 3, column: j + 1},
          source: 'priorSource.js'
        });
      }
    }
    var inputMap = g.toJSON();

    var compiler = new Compiler({
      sourceMaps: 'file',
      script: true,
      inputSourceMap: inputMap
    });
    var tree = compiler.parse(src, filename);

    var generatedSource = compiler.write(tree, filename);
    var generatedLines = generatedSource.split('\n');

    // Check that the generated code did not change since we analyzed the map.
    var expectedFilledColumnsZeroThrough = [15, 10, 0, 9, 0, 40, -1];
    generatedLines.forEach(function(line, index) {
      assert.equal(line.length - 1, expectedFilledColumnsZeroThrough[index]);
    });

    var consumer = new SourceMapConsumer(compiler.getSourceMap(filename));

    var testcases = [
      // >f<unction
      {generated: {line: 1, column: 0}, original: {line: 3, column: 1}},
      // function foo() { >r<eturn 5; }
      {generated: {line: 2, column: 0}, original: {line: 3, column: 18}},
      // function foo() { return 5; >}<
      {generated: {line: 3, column: 0}, original: {line: 3, column: 28}},
      {generated: {line: 4, column: 0}, original: {line: 5, column: 1}},
      {generated: {line: 5, column: 1}, original: {line: 8, column: 1}}
    ];

    testcases.forEach(function(testcase, caseNumber) {
      var actual = consumer.originalPositionFor(testcase.generated);
      assert.strictEqual(actual.line, testcase.original.line);
      assert.strictEqual(actual.column, testcase.original.column);
    });

    var sourceContent = consumer.sourceContentFor(filename);
    assert.equal(sourceContent, src);
  });

  test('MultipleFiles', function() {
    var treeA = scriptCompiler.parse('alert(a);', 'a.js');
    var treeB = scriptCompiler.parse('alert(b);', 'b.js');
    var treeC = scriptCompiler.parse('alert(c);', 'c.js');

    // Now create a new program that contains these 3.
    var push = [].push.apply.bind([].push);
    var newProgramElements = [];
    push(newProgramElements, treeA.scriptItemList);
    push(newProgramElements, treeB.scriptItemList);
    push(newProgramElements, treeC.scriptItemList);
    var tree = new Script(null, newProgramElements, null);

    var outFilename = 'out.js';
    var outFileContents = scriptCompiler.write(tree, outFilename);

    var expected = 'alert(a);\nalert(b);\nalert(c);\n//# sourceMappingURL=out.js.map\n';
    assert.equal(expected, outFileContents);

    var map = JSON.parse(scriptCompiler.getSourceMap(outFilename));
    assert.equal(outFilename, map.file);
    assert.deepEqual(['a.js', 'b.js', 'c.js'], map.sources);
  });

  test('ImportSpecifierSetSourceMap', function() {
    var src = "  import {x} from './WrapNewObjectTransformer.js';";

    var filename = 'sourceMapImportSpecifierSet.js';
    var tree = moduleCompiler.parse(src, filename);
    var actual = moduleCompiler.write(tree);
    // The sourceMappingURL should be relativel
    assert.notEqual(actual.indexOf('//# sourceMappingURL=unnamed.js.map'), -1);

    var sourceMap = moduleCompiler.getSourceMap(filename);
    assert.equal(JSON.parse(sourceMap).sources[0], filename);
    var consumer = new SourceMapConsumer(sourceMap);

    var sourceContent = consumer.sourceContentFor(filename);
    assert.equal(sourceContent, src);
  });

});

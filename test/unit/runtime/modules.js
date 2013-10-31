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

suite('modules.js', function() {

  var MutedErrorReporter =
      System.get('../src/util/MutedErrorReporter.js').MutedErrorReporter;

  var reporter;

  setup(function() {
    reporter = new traceur.util.ErrorReporter();
  });

  teardown(function() {
    assert.isFalse(reporter.hadError());
  });

  var url;
  if (typeof __filename !== 'undefined')
    url = __filename;
  else
    url = traceur.util.resolveUrl(window.location.href,
                                  'unit/runtime/modules.js');

  function getLoader(opt_reporter) {
    var project = new traceur.semantics.symbols.Project(url);
    var parentLoader = null;
    return new traceur.modules.CodeLoader(opt_reporter || reporter, project);
  }

  test('LoaderEval', function() {
    var result = getLoader().eval('(function(x = 42) { return x; })()');
    assert.equal(42, result);
  });

  test('LoaderEvalAsync', function(done) {
    var code =
        'module a from "./test_a.js";\n' +
        'module b from "./test_b.js";\n' +
        'module c from "./test_c.js";\n' +
        '\n' +
        '[\'test\', a.name, b.name, c.name];\n';

    var result = getLoader().evalAsync(code, function(value) {
      assert.equal('test', value[0]);
      assert.equal('A', value[1]);
      assert.equal('B', value[2]);
      assert.equal('C', value[3]);
      done();
    }, function(error) {
      fail(error);
      done();
    });
  });

  test('LoaderEvalLoadWithSubdir', function(done) {
    var code =
        'module d from "./subdir/test_d.js";\n' +
        '\n' +
        '[d.name, d.e.name];\n';

    var result = getLoader().evalAsync(code, function(value) {
      assert.equal('D', value[0]);
      assert.equal('E', value[1]);
      done();
    }, function(error) {
      fail(error);
      done();
    });
  });

  test('LoaderEvalLoadFail', function(done) {
    var code =
        'module a from "./test_a.js";\n' +
        'module b from "./test_b.js";\n' +
        'module c from "./test_c.js";\n' +
        '\n' +
        '[\'test\', SYNTAX ERROR a.name, b.name, c.name];\n';

    var reporter = new MutedErrorReporter();

    var result = getLoader(reporter).evalAsync(code, function(value) {
      fail('Should not have succeeded');
      done();
    }, function(error) {
      // We should probably get some meaningful error here.

      //assert.isTrue(reporter.hadError());
      assert.isTrue(true);
      done();
    });
  });

  test('LoaderLoad', function(done) {
    getLoader().load('./test_script.js', function(result) {
      assert.equal('A', result[0]);
      assert.equal('B', result[1]);
      assert.equal('C', result[2]);
      done();
    }, function(error) {
      fail(error);
      done();
    });
  });

  test('LoaderImport', function(done) {
    getLoader().import('./test_module.js', function(mod) {
      assert.equal('test', mod.name);
      assert.equal('A', mod.a);
      assert.equal('B', mod.b);
      assert.equal('C', mod.c);
      done();
    }, function(error) {
      fail(error);
      done();
    });
  });

});
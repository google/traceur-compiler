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

suite('Loader.js', function() {

  var MutedErrorReporter =
      $traceurRuntime.ModuleStore.getForTesting('src/util/MutedErrorReporter').MutedErrorReporter;

  var reporter, baseURL;

  setup(function() {
    reporter = new traceur.util.ErrorReporter();
    baseURL = System.baseURL;
  });

  teardown(function() {
    assert.isFalse(reporter.hadError());
    System.baseURL = baseURL;
  });

  var url;
  var fileLoader;
  if (typeof __filename !== 'undefined') {
    // TOD(arv): Make the system work better with file paths, especially
    // Windows file paths.
    url = __filename.replace(/\\/g, '/');
    fileLoader = require('../../../src/node/nodeLoader.js');
  } else {
    url = traceur.util.resolveUrl(window.location.href,
                                  'unit/runtime/modules.js');
  }

  function getLoaderHooks(opt_reporter) {
    var LoaderHooks = traceur.runtime.LoaderHooks;
    opt_reporter = opt_reporter || reporter;
    return new LoaderHooks(opt_reporter, url, undefined, fileLoader);
  }

  function getLoader(opt_reporter) {
    return new traceur.runtime.TraceurLoader(getLoaderHooks(opt_reporter));
  }

  test('LoaderHooks.locate', function() {
    var loaderHooks = getLoaderHooks();
    var load = {
      metadata: {
        baseURL: 'http://example.org/a/'
      },
      data: {}
    }
    load.normalizedName = '@abc/def';
    assert.equal(loaderHooks.locate(load), 'http://example.org/a/@abc/def.js');
    load.normalizedName = 'abc/def';
    assert.equal(loaderHooks.locate(load), 'http://example.org/a/abc/def.js');
  });

  test('traceur@', function() {
    var traceur = System.get('traceur@');
    var optionsModule = $traceurRuntime.ModuleStore.getForTesting('src/options');
    assert.equal(traceur.options, optionsModule.options);
  });

  test('Loader.PreCompiledModule', function(done) {
    var traceur = System.get('traceur@');
    System.import('traceur@', {}, function(module) {
      assert.equal(traceur.options, module.options);
      done();
    });
  });

  test('LoaderEval', function(done) {
    getLoader().script('(function(x = 42) { return x; })()', {},
      function(result) {
        assert.equal(42, result);
        done();
      });
  });

  test('LoaderModule', function(done) {
    var code =
        'module a from "./test_a.js";\n' +
        'module b from "./test_b.js";\n' +
        'module c from "./test_c.js";\n' +
        '\n' +
        'export var arr = [\'test\', a.name, b.name, c.name];\n';

    var result = getLoader().module(code, {},
      function(module) {
        assert.equal('test', module.arr[0]);
        assert.equal('A', module.arr[1]);
        assert.equal('B', module.arr[2]);
        assert.equal('C', module.arr[3]);
        done();
      }, function(error) {
        fail(error);
        done();
      });
  });

  test('LoaderModuleWithSubdir', function(done) {
    var code =
        'module d from "./subdir/test_d.js";\n' +
        '\n' +
        'export var arr = [d.name, d.e.name];\n';

    var result = getLoader().module(code, {},
      function(module) {
        assert.equal('D', module.arr[0]);
        assert.equal('E', module.arr[1]);
        done();
      }, function(error) {
        fail(error);
        done();
      });
  });

  test('LoaderModuleFail', function(done) {
    var code =
        'module a from "./test_a.js";\n' +
        'module b from "./test_b.js";\n' +
        'module c from "./test_c.js";\n' +
        '\n' +
        '[\'test\', SYNTAX ERROR a.name, b.name, c.name];\n';

    var reporter = new MutedErrorReporter();

    var result = getLoader(reporter).module(code, {},
      function(value) {
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
    getLoader().loadAsScript('./test_script.js', {}, function(result) {
      assert.equal('A', result[0]);
      assert.equal('B', result[1]);
      assert.equal('C', result[2]);
      done();
    }, function(error) {
      fail(error);
      done();
    });
  });

  test('LoaderLoadWithReferrer', function(done) {
    getLoader().loadAsScript('../test_script.js',
      {referrerName: 'traceur@0.0.1/bin'},
      function(result) {
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
    getLoader().import('./test_module.js', {}, function(mod) {
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

  test('LoaderImportWithReferrer', function(done) {
    getLoader().import('../test_module.js',
      {referrerName: 'traceur@0.0.1/bin'},
      function(mod) {
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

  test('System.semverMap', function() {
    var System =
        $traceurRuntime.ModuleStore.getForTesting('src/runtime/System').System;

    var semVerRegExp = System.semVerRegExp_();
    var m = semVerRegExp.exec('1.2.3-a.b.c.5.d.100');
    assert.equal(1, m[1]);
    assert.equal(2, m[2]);
    m = semVerRegExp.exec('1.2.X');
    assert(!m);
    m = semVerRegExp.exec('Any');
    assert(!m);

    var version = System.map['traceur'];
    assert(version);
    // This test must be updated if the major or minor version number changes.
    // If the change is intended, this is a reminder to update the documentation.
    assert.equal(version, System.map['traceur@0']);
    assert.equal(version, System.map['traceur@0.0']);
  });

});

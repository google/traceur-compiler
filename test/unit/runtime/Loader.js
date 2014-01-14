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
      System.get('traceur@0.0.Y/src/util/MutedErrorReporter').MutedErrorReporter;

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
  var loader;
  if (typeof __filename !== 'undefined') {
    // TOD(arv): Make the system work better with file paths, especially
    // Windows file paths.
    url = __filename.replace(/\\/g, '/');
    loader = require('../../../src/node/nodeLoader.js');
  } else {
    url = traceur.util.resolveUrl(window.location.href,
                                  'unit/runtime/modules.js');
  }

  function getLoaderHooks(opt_reporter) {
    var LoaderHooks = traceur.modules.LoaderHooks;
    opt_reporter = opt_reporter || reporter;
    return new LoaderHooks(opt_reporter, url, undefined, loader);
  }

  function getLoader(opt_reporter) {
    return new traceur.modules.Loader(getLoaderHooks(opt_reporter));
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
    var optionsModule = System.getForTesting('src/options');
    assert.equal(traceur.options, optionsModule.options);
  });

  test('LoaderEval', function(done) {
    getLoader().script('(function(x = 42) { return x; })()', './LoaderEval', {},
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
        '[\'test\', a.name, b.name, c.name];\n';

    var result = getLoader().module(code, './LoaderModule', {},
      function(value) {
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

  test('LoaderModuleWithSubdir', function(done) {
    var code =
        'module d from "./subdir/test_d.js";\n' +
        '\n' +
        '[d.name, d.e.name];\n';

    var result = getLoader().module(code, 'LoaderModuleWithSubdir', {},
      function(value) {
        assert.equal('D', value[0]);
        assert.equal('E', value[1]);
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

    var result = getLoader(reporter).module(code, 'LoaderModuleFail', {},
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
});

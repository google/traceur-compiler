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
    return new LoaderHooks(opt_reporter, url, fileLoader);
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
    load.normalizedName = 'abc/def.js';
    assert.notEqual(loaderHooks.locate(load), 'http://example.org/a/abc/def.js');
  });

  test('traceur@', function() {
    var traceur = System.get('traceur@');
    var optionsModule = $traceurRuntime.ModuleStore.getForTesting('src/options');
    assert.equal(traceur.options, optionsModule.options);
  });

  test('Loader.PreCompiledModule', function(done) {
    var traceur = System.get('traceur@');
    System.import('traceur@', {}).then(function(module) {
      assert.equal(traceur.options, module.options);
      done();
    });
  });

  test('Loader.Script', function(done) {
    getLoader().script('(function(x = 42) { return x; })()', {}).then(
      function(result) {
        assert.equal(42, result);
        done();
      });
  });

  test('Loader.Script.Named', function(done) {
    var loader = getLoader();
    loader.options.sourceMaps = true;
    var name = '43';
    loader.script('(function(x = 43) { return x; })()', {name: name}).then(
      function(result) {
        try {
          loader.options.sourceMaps = false;
          var normalizedName = System.normalize(name);
          var sourceMap = loader.sourceMap(normalizedName, 'script');
          assert(sourceMap);
          assert.equal(43, result);
          done();
        } catch (ex) {
          done(ex);
        }
      });
  });

  test('Loader.Script.Fail', function(done) {
    var reporter = new MutedErrorReporter();
    getLoader(reporter).script('export var x = 5;', {}).then(
      function(result) {
        fail('should not have succeeded');
        done();
      }, function(ex) {
        assert(ex);
        done();
      });
  });

  test('LoaderModule', function(done) {
    var code =
        'module a from "./test_a";\n' +
        'module b from "./test_b";\n' +
        'module c from "./test_c";\n' +
        '\n' +
        'export var arr = [\'test\', a.name, b.name, c.name];\n';

    var result = getLoader().module(code, {}).then(
      function(module) {
        assert.equal('test', module.arr[0]);
        assert.equal('A', module.arr[1]);
        assert.equal('B', module.arr[2]);
        assert.equal('C', module.arr[3]);
        assert.isNull(Object.getPrototypeOf(module));
        done();
      }, function(error) {
        fail(error);
        done();
      });
  });

  test('LoaderModuleWithSubdir', function(done) {
    var code =
        'module d from "./subdir/test_d";\n' +
        '\n' +
        'export var arr = [d.name, d.e.name];\n';

    var result = getLoader().module(code, {}).then(
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
        'module a from "./test_a";\n' +
        'module b from "./test_b";\n' +
        'module c from "./test_c";\n' +
        '\n' +
        '[\'test\', SYNTAX ERROR a.name, b.name, c.name];\n';

    var reporter = new MutedErrorReporter();

    var result = getLoader(reporter).module(code, {}).then(
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
    getLoader().loadAsScript('./test_script.js', {}).then(function(result) {
      assert.equal('A', result[0]);
      assert.equal('B', result[1]);
      assert.equal('C', result[2]);
      done();
    }, function(error) {
      fail(error);
      done();
    });
  });

  test('LoaderLoad.Fail', function(done) {
    var reporter = new MutedErrorReporter();
    getLoader(reporter).loadAsScript('./non_existing.js', {}).then(function(result) {
      fail('should not have succeeded');
      done();
    }, function(error) {
      assert(error);
      done();
    });
  });

  test('LoaderLoadWithReferrer', function(done) {
    getLoader().loadAsScript('../test_script.js',
      {referrerName: 'traceur@0.0.1/bin'}).then(
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
    getLoader().import('./test_module', {}).then(function(mod) {
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

  test('LoaderImport.Fail', function(done) {
    var reporter = new MutedErrorReporter();
    getLoader(reporter).import('./non_existing', {}).then(function(mod) {
      fail('should not have succeeded')
      done();
    }, function(error) {
      assert(error);
      done();
    });
  });

  test('LoaderImportWithReferrer', function(done) {
    getLoader().import('../test_module',
      {referrerName: 'traceur@0.0.1/bin'}).then(function(mod) {
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

  test('Loader.define', function(done) {
    var name = System.normalize('./test_define');
    getLoader().import('./side-effect', {}).then(function(mod) {
      assert.equal(6, mod.currentSideEffect());  // starting value.
      var src = 'export {name as a} from \'./test_a\';\n' +
        'export var d = 4;\n' + 'this.sideEffect++;';
      getLoader().define(name, src, {}).then(function() {
          assert.equal(6, mod.currentSideEffect());  // no change
          var definedModule = System.get(name);
          assert.equal(7, mod.currentSideEffect());  // module body evaluated
          assert.equal(4, definedModule.d);  // define does exports
          assert.equal('A', definedModule.a);  // define does imports
          done();
        }, function(error) {
          fail(error);
          done();
        });
    });
  });

  test('Loader.define.Fail', function(done) {
    var name = System.normalize('./test_define');
    var reporter = new MutedErrorReporter();
    getLoader(reporter).import('./side-effect', {}).then(function(mod) {
      var src = 'syntax error';
      getLoader(reporter).define(name, src, {}).then(function() {
          fail('should not have succeeded');
          done();
        }, function(error) {
          assert(error);
          done();
        });
    });
  });

  test('Loader.defineWithSourceMap', function(done) {
    var normalizedName = System.normalize('./test_define_with_source_map');
    var loader = getLoader();
    loader.options.sourceMaps = true;
    var src = 'export {name as a} from \'./test_a\';\nexport var d = 4;\n';
    loader.define(normalizedName, src, {}).then(function() {
        var sourceMap = loader.sourceMap(normalizedName, 'module');
        assert(sourceMap);
        var SourceMapConsumer = traceur.outputgeneration.SourceMapConsumer;
        var consumer = new SourceMapConsumer(sourceMap);
        var sourceContent = consumer.sourceContentFor(normalizedName);
        assert.equal(sourceContent, src);
        done();
      }, function(error) {
        fail(error);
        done();
      }
    );
  });

  test('System.semverMap', function() {
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

  test('System.map', function() {
    System.map = System.semverMap('traceur@0.0.13/src/runtime/System');
    var version = System.map['traceur'];
    var remapped = System.normalize('traceur@0.0/src/runtime/System');
    var versionSegment = remapped.split('/')[0];
    assert.equal(version, versionSegment);
  });

  test('System.applyMap', function() {
    var originalMap = System.map;
    System.map['tests/contextual'] = {
      maptest: 'tests/contextual-map-dep'
    };
    var contexualRemap = System.normalize('maptest', 'tests/contextual');
    assert.equal('tests/contextual-map-dep', contexualRemap);
    // prefix must match up to segment delimiter '/'
    System.map = {
      jquery: 'jquery@2.0.0'
    };
    var remap = System.normalize('jquery-ui');
    assert.equal('jquery-ui', remap);
    System.map = originalMap;
  });

  test('AnonModuleSourceMap', function() {
    var src = "  import {name} from './test_a';";

    var loader = getLoader();
    loader.options.sourceMap = true;

    loader.module(src, {}, function (mod) {
      assert(mod);
    }, function(err) {
      throw new Error('AnonModuleSourceMap FAILED ');
    });

  });

});

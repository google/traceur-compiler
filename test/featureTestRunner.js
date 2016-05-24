// Copyright 2015 Traceur Authors.
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


import {StringMap} from '../src/util/StringMap.js';
import {NodeTraceurTestRunner} from './modular/NodeTraceurTestRunner.js';
import {BrowserTraceurTestRunner} from './modular/BrowserTraceurTestRunner.js';
import {Options} from '../src/Options.js';
import {ModuleStore} from '../src/loader/ModuleStore.js';
import parseProlog from '../src/util/parseProlog.js';

import {assert} from './asserts.js';
export * from './asserts.js';

assert.type = function (actual, type) {
  assert.typeOf(actual, type.name);
  return actual;
};

let pathRe = /([^\s']+?)(?=test(?:[\/\\])feature(?:[\/\\]))/g;

function normalizeErrorPaths(actualError) {
  // We normally check errors without comparing the path part. For module
  // related errors, the error message itself has path. Convert those
  // paths to relative UNIX paths wheter they are UNIX, Windows or URLs.
  let cleanError = actualError.replace(pathRe, '').replace(/\\/g, '/');
  return cleanError;
}

$traceurRuntime.options = new Options();

function setOptions(load, prologOptions) {
  let traceurOptions = new Options(prologOptions.traceurOptions);
  traceurOptions.debug = true;  // Asserts throw
  traceurOptions.validate = true;
  traceurOptions.sourceMaps ='memory';
  load.metadata.traceurOptions = traceurOptions;
}

function featureTest(name, url) {
  test(name, (done) => {
    let baseURL = './';

    let prologOptions;
    function translateSynchronous(load) {
      let source = load.source;

      // Only top level file can set prologOptions, but we can get here when we
      // are translating imported dependencies.
      if (prologOptions) {
        return source;
      }

      prologOptions = parseProlog(source);

      if (prologOptions.skip) {
        return '';
      }

      if (prologOptions.async) {
        global.done = (ex) => {
          handleExpectedErrors(ex);
          done(ex);
        };
      }
      setOptions(load, prologOptions);
      return source;
    }

    let moduleLoader = new System.constructor();

    moduleLoader.translate = translateSynchronous;

    function handleExpectedErrors(error) {
      if (prologOptions.shouldHaveErrors) {
        assert.isTrue(error !== undefined,
            'Expected error compiling ' + name + ', but got none.');

        error = error.errors || error;
        let actualErrors = (error instanceof Array) ? error : [error];

        actualErrors = actualErrors.map(
            (error) => normalizeErrorPaths(error + ''));
        prologOptions.expectedErrors.forEach((expected, index) => {
          assert.isTrue(
              actualErrors.some(
                  (actualError) => actualError.indexOf(expected) !== -1),
              'Missing expected error: ' + expected +
              '\nActual errors:\n' + actualErrors);
        });
      }
    }

    function handleSuccess(result) {
      if (prologOptions.skip) {
        done();
        return;
      }

      if (prologOptions.async)
        return;

      handleExpectedErrors();
      done();
    }

    function handleFailure(error) {
      handleExpectedErrors(error);
      if (!prologOptions.shouldHaveErrors) {
        done(error)
      } else {
        done();
      }
    }

    const isScript = /\.script\.js$/.test(url);
    if (isScript) {
      moduleLoader.loadAsScript(url, {}).then(handleSuccess,
          handleFailure).catch(done);
    } else {
      moduleLoader.import(url, {}).then(handleSuccess,
          handleFailure).catch(done);
    }
  });
}

function cloneTest(name, url) {

  function doTest(source) {
    let prologOptions = parseProlog(source);
    if (prologOptions.skip || prologOptions.shouldHaveErrors) {
      return;
    }

    let options = new Options(prologOptions.traceurOptions);

    let reporter = new traceur.util.CollectingErrorReporter();

    function parse(source) {
      let file = new traceur.syntax.SourceFile(name, source);
      let parser = new traceur.syntax.Parser(file, reporter, options);
      let isScript = /\.script\.js$/.test(url);
      if (isScript) {
        return parser.parseScript();
      }
      return parser.parseModule();
    }

    let tree = parse(source);

    if (reporter.hadError()) {
      assert.fail('cloneTest Error compiling ' + name + '.\n' +
           reporter.errorsAsString());
      return;
    }

    let CloneTreeTransformer = traceur.codegeneration.CloneTreeTransformer;
    let clone = CloneTreeTransformer.cloneTree(tree);
    let code = traceur.outputgeneration.TreeWriter.write(tree);
    let cloneCode = traceur.outputgeneration.TreeWriter.write(clone);
    assert.equal(code, cloneCode);

    // Parse again to ensure that writer generates valid code.
    clone = parse(cloneCode);
    if (reporter.hadError()) {
      assert.fail('Error compiling generated code for ' + name + '.\n' +
                  reporter.errors.join('\n'));
      return;
    }

    cloneCode = traceur.outputgeneration.TreeWriter.write(clone);
    assert.equal(code, cloneCode);
  }

  let moduleLoader = new System.constructor();

  test(name, (done) => {
    let load = {
      metadata: {},
      normalizedName:
          ModuleStore.normalize(url)
    };
    load.address = System.locate(load);
    moduleLoader.fetch({address: url}).then((data) => {
      doTest(data);
      done();
    }, (ex) => {
      assert.fail('Load error for ' + url + ': ' + ex);
      done();
    });
  });
}

Reflect.global.assert = assert;

function importFeatureFiles(files) {
  return new Promise((resolve) => {
    // Bucket tests.
    let testBucket = new StringMap();
    files.forEach((path) => {
      let parts = path.split('/');
      parts = parts.slice(3);
      path = parts.join('/');
      let suiteName = parts.slice(0, -1).join(' ') || '(root)';
      let name = parts[parts.length - 1];
      if (!testBucket.has(suiteName)) {
        testBucket.set(suiteName, []);
      }
      testBucket.get(suiteName).push({name, path});
    });

    suite('Feature Tests', () => {
      testBucket.keysAsArray().forEach((suiteName) => {
        suite(suiteName, () => {
          testBucket.get(suiteName).forEach((tuple) => {
            featureTest(tuple.name, './test/feature/' + tuple.path);
          });
        });
      });
    });

    suite('Clone Tree Tests', () => {
      testBucket.keysAsArray().forEach((suiteName) => {
        suite(suiteName, () => {
          testBucket.get(suiteName).forEach((tuple) => {
            cloneTest(tuple.name, './test/feature/' + tuple.path);
          });
        });
      });
    });
    resolve();
  });
}

class NodeTraceurFeatureTestRunner extends NodeTraceurTestRunner {
  importFiles() {
    return importFeatureFiles(this.files);
  }
}

class BrowserTraceurFeatureTestRunner extends BrowserTraceurTestRunner {
  importFiles() {
    return importFeatureFiles(this.files);
  }
}

export let featureTestRunner;
if (typeof require === 'undefined') {
  featureTestRunner = new BrowserTraceurFeatureTestRunner();
} else {
  featureTestRunner = new NodeTraceurFeatureTestRunner();
}

let context = featureTestRunner.getContext();

export let suite = context.suite;
export let test = context.test;
export let setup = context.setup;
export let teardown = context.teardown;

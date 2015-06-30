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

import {assert, assertArrayEquals} from './asserts.js';
export * from './asserts.js';

function forEachPrologLine(s, f) {
  let inProlog = true;
  for (let i = 0; inProlog && i < s.length; ) {
    let j = s.indexOf('\n', i);
    if (j == -1)
      break;
    if (s[i] === '/' && s[i + 1] === '/') {
      let line = s.slice(i, j);
      f(line);
      i = j + 1;
    } else {
      inProlog = false;
    }
  }
}

export function parseProlog(source) {
  let returnValue = {
    onlyInBrowser: false,
    skip: false,
    get shouldHaveErrors() {
      return this.expectedErrors.length !== 0;
    },
    expectedErrors: [],
    async: false
  };
  forEachPrologLine(source, (line) => {
    let m;
    if (line.indexOf('// Only in browser.') === 0) {
      returnValue.onlyInBrowser = true;
    } else if (line.indexOf('// Skip.') === 0) {
      returnValue.skip = true;
    } else if (line.indexOf('// Async.') === 0) {
      returnValue.async = true;
    } else if ((m = /\/\ Options:\s*(.+)/.exec(line))) {
      returnValue.traceurOptions = traceur.util.CommandOptions.fromString(m[1]);
    } else if ((m = /\/\/ Error:\s*(.+)/.exec(line))) {
      returnValue.expectedErrors.push(m[1]);
    }
  });
  return returnValue;
}

assert.type = function (actual, type) {
  assert.typeOf(actual, type.name);
  return actual;
};

function assertNoOwnProperties(o) {
  let m = Object.getOwnPropertyNames(o);
  if (m.length) {
    fail('Unexpected members found:' + m.join(', '));
  }
}

function assertHasOwnProperty(o) {
  let args = Array.prototype.slice.call(arguments, 1);
  for (let i = 0; i < args.length; i ++) {
    let m = args[i];
    if (!o.hasOwnProperty(m)) {
      fail('Expected member ' + m + ' not found.');
    }
  }
}

function assertLacksOwnProperty(o) {
  let args = Array.prototype.slice.call(arguments, 1);
  for (let i = 0; i < args.length; i ++) {
    let m = args[i];
    if (o.hasOwnProperty(m)) {
      fail('Unxpected member ' + m + ' found.');
    }
  }
}

function fail(message) {
  throw new AssertionError(message);
}

let pathRe = /([^\s']+?)(?=test(?:[\/\\])feature(?:[\/\\]))/g;

function normalizeErrorPaths(actualError) {
  // We normally check errors without comparing the path part. For module
  // related errors, the error message itself has path. Convert those
  // paths to relative UNIX paths wheter they are UNIX, Windows or URLs.
  let cleanError = actualError.replace(pathRe, '').replace(/\\/g, '/');
  return cleanError;
}

let Options = traceur.get('./Options.js').Options;
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
      // Only top level file can set prologOptions.
      if (!prologOptions)
        prologOptions = parseProlog(source);

      if (prologOptions.skip)
        return '';

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

    moduleLoader.translate = (load) => {
      return new Promise((resolve, reject) => {
        resolve(translateSynchronous(load));
      });
    }

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

    if (/\.module\.js$/.test(url)) {
      moduleLoader.import(url, {}).then(handleSuccess,
          handleFailure).catch(done);
    } else {
      moduleLoader.loadAsScript(url, {}).then(handleSuccess,
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
      let isModule = /\.module\.js$/.test(url);
      if (isModule)
        return parser.parseModule();
      else
        return parser.parseScript();
    }

    let tree = parse(source);

    if (reporter.hadError()) {
      fail('cloneTest Error compiling ' + name + '.\n' +
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
      fail('Error compiling generated code for ' + name + '.\n' +
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
          System.normalize(url)
    };
    load.address = System.locate(load);
    moduleLoader.fetch({address: url}).then((data) => {
      doTest(data);
      done();
    }, (ex) => {
      fail('Load error for ' + url + ': ' + ex);
      done();
    });
  });
}

Reflect.global.assert = assert;
Reflect.global.assertArrayEquals = assertArrayEquals;
Reflect.global.assertHasOwnProperty = assertHasOwnProperty;
Reflect.global.assertLacksOwnProperty = assertLacksOwnProperty;
Reflect.global.assertNoOwnProperties = assertNoOwnProperties;
Reflect.global.fail = fail;

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
if (typeof window !== 'undefined') {
  featureTestRunner = new BrowserTraceurFeatureTestRunner();
} else {
  featureTestRunner = new NodeTraceurFeatureTestRunner();
}

featureTestRunner.applyOptions([
  './test/feature/*/*.js',
  './test/feature/*.js'
]);

let context = featureTestRunner.getContext();

export let suite = context.suite;
export let test = context.test;
export let setup = context.setup;
export let teardown = context.teardown;

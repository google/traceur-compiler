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

suite('FreeVariableChecker.traceur.js', function() {

  setup(function() {
    traceur.options.freeVariableChecker = true;
  });

  teardown(function() {
    traceur.options.reset();
  });

  function compile(contents, name) {
    var name = 'code';
    var LoaderHooks = traceur.runtime.LoaderHooks;
    var TraceurLoader = traceur.runtime.TraceurLoader;
    var reporter = new traceur.util.ErrorReporter();
    var url = 'http://www.test.com/';
    var loaderHooks = new LoaderHooks(reporter, url);
    var loader = new TraceurLoader(loaderHooks);
    return loader.script(contents, url);
  }

  function assertCompileError(contents, expectedError) {
    var ex;
    try {
      compile(contents, 'code');
    } catch (e) {
      ex = e;
    }
    assert.instanceOf(ex, ReferenceError);
    assert.equal(ex.message, expectedError);
    // assertErrorMessage(errors, expectedError, expectedErrorArg);
  }

  function makeCompileTest(code, name) {
    return test('FreeVariables', function(done) {
      traceur.options.experimental = true;
      compile(code).then(function() {
        done(new Error('Expected a ReferenceError for ' + name));
      }, function(err) {
        try {
          assert.instanceOf(err, ReferenceError);
          assert.isTrue(err.message.indexOf(name + ' is not defined') !== -1);
        } catch(ex) {
          done(ex);
          return;
        }
        done();
      });
    });
  }

  makeCompileTest('var y = xxx;', 'xxx');
  makeCompileTest('xxx(1,2,3);', 'xxx');
  makeCompileTest('function foo() { return xxx; }', 'xxx');
  makeCompileTest('if (true) { console.log(yyy); }', 'yyy');
  makeCompileTest('function foo() { { let yyy = 5; }; return yyy; }', 'yyy');
  makeCompileTest('xxx = 42;', 'xxx');
  makeCompileTest('xxx.y = 42;', 'xxx');
  makeCompileTest('fff(42);', 'fff');
  makeCompileTest('xxx.f(42);', 'xxx');

  test('FreeVariables2', function() {
    // Make sure these don't cause an error
    var x = [1, 2];
    var y = [0, ...x, 3];
    assert.equal('0,1,2,3', y.join(','));
  });

  test('FreeVariables3', function() {
    // Regression test.
    assert.equal('function', typeof setTimeout);
  });

});

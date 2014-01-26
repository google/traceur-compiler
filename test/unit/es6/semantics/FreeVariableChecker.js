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

  function compileAndReturnErrors(contents, name) {
    var LoaderHooks = traceur.runtime.LoaderHooks;
    var TraceurLoader = traceur.runtime.TraceurLoader;
    var reporter = new traceur.util.ErrorReporter();
    var errors = [];
    reporter.reportMessageInternal = function() {
      errors.push(arguments);
    };
    var url = 'http://www.test.com/';
    var loaderHooks = new LoaderHooks(reporter, url);
    var loader = new TraceurLoader(loaderHooks);
    loader.script(contents, url);
    return errors;
  }

  function assertErrorMessage(errors, expectedError, expectedErrorArg) {
    assert.isTrue(errors.length > 0);
    assert.equal(expectedError, errors[0][1]);
    assert.equal(expectedErrorArg, errors[0][2][0]);
  }

  function assertCompileError(contents, expectedError, expectedErrorArg) {
    var errors = compileAndReturnErrors(contents, 'code');
    assertErrorMessage(errors, expectedError, expectedErrorArg);
  }

  test('FreeVariables', function() {
    traceur.options.experimental = true;
    assertCompileError('var y = xxx;', '%s is not defined', 'xxx');
    assertCompileError('xxx(1,2,3);', '%s is not defined', 'xxx');
    assertCompileError('function foo() { return xxx; }', '%s is not defined', 'xxx');
    assertCompileError('if (true) { console.log(yyy); }', '%s is not defined', 'yyy');
    assertCompileError('function foo() { { let yyy = 5; }; return yyy; }',
        '%s is not defined', 'yyy');
    assertCompileError('xxx = 42;', '%s is not defined', 'xxx');
    assertCompileError('xxx.y = 42;', '%s is not defined', 'xxx');
    assertCompileError('fff(42);', '%s is not defined', 'fff');
    assertCompileError('xxx.f(42);', '%s is not defined', 'xxx');
    // TODO(jmesserly): we shouldn't be putting traceur into the global scope
    // assertCompileError('traceur.runtime = {};', '%s is not defined', 'traceur');
  });

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

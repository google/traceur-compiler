// Copyright 2014 Traceur Authors.
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

// Run's test from https://github.com/kangax/compat-table

import {Compiler} from '../src/Compiler.js';
import {IDENTIFIER_EXPRESSION} from '../src/syntax/trees/ParseTreeType.js';

Reflect.global.exports = {};

var failures = 0;

function checkTest(test, traceurResult) {
  if (test.res.tr !== traceurResult) {
    failures++;
    console.error('FAIL: ' + test.name + ' should be ' + !test.res.tr);
    return false;
  }
  return true;
}

var traceurResult;

System.fetch({address: './node_modules/es5-compat-table/data-es6.js'}).then((tests) => {
  var unknown = [];
  tests = eval(tests);
  tests.forEach((test)  => {
    if (typeof test.exec !== 'function') {
      unknown.push(test.name);
    } else {
      // The compat-table tests are in functions under the property 'exec';
      var functionExpr = test.exec + '';
      // Interior of the function body is surrounded by comments, because
      //   the es6 code won't compile into a function.
      var m = functionExpr.match(/[^]*\/\*([^]*)\*\/\}$/);
      functionExpr = m ? 'function x() {\n' + m[1] + '}': functionExpr;
      functionExpr = '(' + functionExpr + '());';
      // Except when the test is inexplicable just an eval().
      m = functionExpr.match(/eval\(\'([^\']*)\'\)/);
      var src = m ?  m[1] : functionExpr;
      var evalBasedTest = !!m;
      var options = {};
      if (!/module/.test(test.name)) {
        options.script = true;
      } else {
        options.moduleName = test.name;
      }
      try {
        var transcoded = (new Compiler(options)).compile(src);
        traceurResult = (0, eval)(transcoded);
        // Some of the compat-table test return status, but eval based ones
        // do not.
        traceurResult = evalBasedTest ? true : traceurResult;
        checkTest(test, !!traceurResult);
      } catch (ex) {
        checkTest(test, false);
      }
    }
  });
  if (!failures) {
    console.log('compat-table PASS, ' + unknown.length +
        ' tests could not be run');
  } else {
    throw new Error(failures +
        ' compat-table failures, update tests/compat-table/data-es6.js');
  }
}).catch((ex) => {
  console.error(ex.stack || ex);
  throw ex;
});
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

import {Compiler} from '../src/Compiler';
import {FindVisitor} from '../src/codegeneration/FindVisitor';

Reflect.global.exports = {};

var compiler = new Compiler();

class FindEvalVisitor extends FindVisitor {
  visitCallExpression(tree) {
    if (tree.operand.identifierToken) {
      var shouldBeEval = tree.operand.identifierToken.value;
      if (shouldBeEval === 'eval') {
        var arg = compiler.treeToString({tree: tree.args,options:{}}).js
        this.found = arg.substring(2, arg.length - 2);
      }
    }
  }
}

var failures = 0;

function checkTest(test, traceurResult) {
  if (test.res.tr !== traceurResult) {
    failures++;
    console.error('FAIL: ' + test.name + ' should be ' + !test.res.tr);
  }
}

System.loadAsScript('./test/compat-table/data-es6.js').then((tests) => {
  var unknown = [];
  tests.forEach((test)  => {
    if (typeof test.exec !== 'function') {
      unknown.push(test.name);
    } else {
      var src = 'var f = ' + test.exec + '';

      var m = /eval\(([^\)]*)\)/.exec(src);
      if (m) {
        var {tree} = compiler.stringToTree({content: src});
        var visitor = new FindEvalVisitor();
        visitor.visitAny(tree);
        if (visitor.found) {
          try {
            (0, eval)(compiler.module(visitor.found).js);
            checkTest(test, true);
          } catch (ex) {
            checkTest(test, false);
          }
        } else {
          unknown.push(test.name);
        }
      } else {
        checkTest(test, test.exec());
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
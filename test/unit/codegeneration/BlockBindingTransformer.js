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

import {
  suite,
  test,
  assert,
  setup,
  teardown
} from '../../unit/unitTestRunner.js';

import {BlockBindingTransformer} from '../../../src/codegeneration/BlockBindingTransformer.js';
import {UniqueIdentifierGenerator} from '../../../src/codegeneration/UniqueIdentifierGenerator.js';
import {Parser} from '../../../src/syntax/Parser.js';
import {SourceFile} from '../../../src/syntax/SourceFile.js';
import {write} from '../../../src/outputgeneration/TreeWriter.js';
import {ParseTreeValidator} from '../../../src/syntax/ParseTreeValidator.js';
import {Options} from '../../../src/Options.js';
import {CollectingErrorReporter as ErrorReporter} from '../../../src/util/CollectingErrorReporter.js';

suite('BlockBindingTransformer.js', function() {

  var options = new Options();
  var currentOption;

  setup(function() {
    currentOption = options.blockBinding;
    options.blockBinding = true;
  });

  teardown(function() {
    options.blockBinding = currentOption;
  });

  function parseExpression(content) {
    var file = new SourceFile('test', content);
    var parser = new Parser(file, undefined, options);
    return parser.parseExpression();
  }

  function parseFunction(content) {
    return parseExpression('function() {' + content + '}');
  }

  function normalize(content) {
    var tree = parseExpression('function() {' + content + '}').body;
    return write(tree);
  }

  function makeTest(name, code, expected) {
    test(name, function() {
      var tree = parseFunction(code);
      var reporter = new ErrorReporter();
      var transformer = new BlockBindingTransformer(
          new UniqueIdentifierGenerator(), reporter, tree);
      var transformed = transformer.transformAny(tree);
      new ParseTreeValidator().visitAny(transformed);
      assert.equal(write(transformed.body), normalize(expected));
      assert.lengthOf(reporter.errors, 0);
    });
  }

  makeTest('Let to Var', 'let x;', 'var x;');
  makeTest('Let to Var In Block',
      '1; { 2; let x; }',
      '1; { 2; var x; }');
  makeTest('Let to Var In Block',
      '1; if (true) { 2; let x = 5; }',
      '1; if (true) { 2; var x = 5; }');


  makeTest('Let to Var In ForLoop',
      'for (let i = 0; i < 5; i++);',
      'for (var i = 0; i < 5; i++);');
  makeTest('Let to Var In ForLoop 2',
      'for (let i = 0; i < 5; i++) { log(i); function t(){} }',
      // =======
      'for (var i = 0; i < 5; i++) {' +
      '  var t = function() {};' +
      '  log(i);' +
      '}');


  makeTest('Let to Var In ForLoop with Fn using local var',
      'for (let i = 0; i < 5; i++) {' +
      '  function t(){alert(i); let i = 5;}' +
      '}',
      // =======
      'for (var i = 0; i < 5; i++) {' +
      '  var t = function() {alert(i); var i = 5;};' +
      '}');


  makeTest('Let to Var with name collisions',
     'if (true) { let x = 5; }'+
     'if (true) { let x = 5; }',
     // =======
      'if (true) {' +
      '  var x = 5;' +
      '}' +
      'if (true) {' +
      '  var x$__0 = 5;' +
      '}');

  suite('Loops with Fns using block variables', function() {
    makeTest('Let to Var in',
        'for(let i = 0; i < 5; i++){ function t(){log(i)} }',
        // ======
        'var $__0 = function(i) {' +
        '  function t() {' +
        '    log(i);' +
        '  }' +
        '};' +
        'for (var i = 0; i < 5; i++) {' +
          '$__0(i);' +
        '}');

    makeTest('Return in Fn',
        'for(let i = 0; i < 5; i++) { return function t(){return i;} }',
        // =======
        'var $__0 = function(i) {' +
        '  return {v: function t() {' +
        '    return i;' +
        '  }};' +
        '}, $__1;' +
        'for (var i = 0; i < 5; i++) {' +
        '  $__1 = $__0(i);' +
        '  if (typeof $__1 === "object") ' +
        '    return $__1.v;' +
        '}');

    makeTest('Return nothing in Fn',
        'for(let i = 0; i < 5; i++) { return; function t(){return i;} } }',
        // =======
        'var $__0 = function(i) {' +
        '  return {v: (void 0)};' +
        '  function t(){return i;}' +
        '}, $__1;' +
        'for (var i = 0; i < 5; i++) {' +
        '  $__1 = $__0(i);' +
        '  if (typeof $__1 === "object") ' +
        '    return $__1.v;' +
        '}');

    makeTest('Break and Continue in Fn',
        '"use strict";' +
        'outer: while(true) {' +
        '  for (let i = 0; i < 5; i++) { ' +
        '    inner: while (true) {' +
        '      break;' +
        '      break outer;' +
        '      break inner;' +
        '      continue;' +
        '      continue outer;' +
        '      continue inner;' +
        '      function t() {return i;}' +
        '    }' +
        '  }' +
        '}',
        // ======
        '"use strict";' +
        'outer: while (true) {' +
        '  var $__0 = function (i) {' +
        '    inner: while (true) {' +
        '      var t = function() {' +
        '        return i;' +
        '      };' +
        '      break;' +
        '      return 0;' +
        '      break inner;' +
        '      continue;' +
        '      return 1;' +
        '      continue inner;' +
        '    }' +
        '  }, $__1 = void 0;' +
        '  for (var i = 0; i < 5; i++) {' +
        '    $__1 = $__0(i);' +
        '    switch ($__1) {' +
        '      case 0:' +
        '        break outer;' +
        '      case 1:' +
        '        continue outer;' +
        '    }' +
        '  }' +
        '}');


    makeTest('This and Arguments',
        'for (let i = 0; i < 5; i++) {' +
        '  console.log(this, arguments);' +
        '  function t() { log(i); }' +
        '}',
        // ======
        'var $__0 = arguments,' +
        '    $__1 = this,' +
        '    $__2 = function(i) {' +
        '      console.log($__1, $__0);' +
        '      function t() { log(i); }' +
        '    };' +
        'for (var i = 0; i < 5; i++) {' +
        '$__2(i);' +
        '}');

    makeTest('Hoist Var Declaration',
        'for(let i = 0; i < 5; i++){ var k = 1; function t(){log(i)} }',
        // ======
        'var k, $__0 = function(i) {' +
        '  k = 1;' +
        '  function t() {' +
        '    log(i);' +
        '  }' +
        '};' +
        'for (var i = 0; i < 5; i++) {' +
        '$__0(i);' +
        '}');

    makeTest('Function as Block Binding',
        'for(let i = 0; i < 5; i++){ function k() {} function t(){log(k)} }',
        // ======
        'var $__0 = function(i) {' +
        '  function k() {}' +
        '  function t() {' +
        '    log(k);' +
        '  }' +
        '};' +
        'for (var i = 0; i < 5; i++) {' +
        '$__0(i);' +
        '}');

    makeTest('Loop with Var initializer remains untouched',
        'for(var i = 0; i < 5; i++){' +
        '  let x = 10;' +
        '  function t() {console.log(x)}' +
        '}',
        // ======
        'var $__0 = function() {' +
        '  var x = 10;' +
        '  function t() {' +
        '    console.log(x);' +
        '  }' +
        '};' +
        'for (var i = 0; i < 5; i++) {' +
        '  $__0();' +
        '}');

    makeTest('Initialize binding',
        `for (;;) {
          let x;
        }`,
        `for (;;) {
          var x = void 0;
        }`);
    makeTest('Initialize binding - var',
        `for (var i = 0; ;) {
          let x;
        }`,
        `for (var i = 0; ;) {
          var x = void 0;
        }`);
    makeTest('Initialize binding - let',
        `for (let i = 0; ;) {
          let x;
        }`,
        `for (var i = 0; ;) {
          var x = void 0;
        }`);

    makeTest('No initializer in for',
        `for (;;) {
          for (let n in {}) {}
        }`,
        `for (;;) {
          for (var n in {}) {}
        }`);
  });

  suite('Hoisting', function() {
    makeTest('Function hoist in block',
        'if (true) { f(); function f() { other() } }',
        // ======
        'if (true) {' +
        '  var f$__0 = function() {' +
        '    other();' +
        '  };' +
        'f$__0();' +
        '}');

    makeTest('Function are untouched when outside block',
        'f(); function f() { other() }',
        'f(); function f() { other() }');
  });

  makeTest('Rename in destructuring',
      'let x = 1; { let {x, y} = {}; }',
      'var x = 1; { var {x: x$__0, y} = {}; }');
  makeTest('Rename in destructuring 2',
      'let x = 1; { let {y, x} = {}; }',
      'var x = 1; { var {y, x: x$__0} = {}; }');

  makeTest('Rename in destructuring 3',
      'let x = 1; { let {x: x, y} = {}; }',
      'var x = 1; { var {x: x$__0, y} = {}; }');
  makeTest('Rename in destructuring 4',
      'let x = 1; { let {y, x: x} = {}; }',
      'var x = 1; { var {y, x: x$__0} = {}; }');

  makeTest('Rename in destructuring with initializer',
      'let x = 1; { let {x, y = x} = {}; }',
      'var x = 1; { var {x: x$__0, y = x$__0} = {}; }');
  makeTest('Rename in destructuring with initializer with binding',
      'let x = 1; { let {x = function x() {}} = {}; }',
      'var x = 1; { var {x: x$__0 = function x() {}} = {}; }');
  makeTest('Rename in destructuring with initializer',
      'let x = 1; { let {x: x = function x() {}} = {}; }',
      'var x = 1; { var {x: x$__0 = function x() {}} = {}; }');
  makeTest('Rename in destructuring with reference in initializer',
      'let x = 1; { let {x = () => x} = {}; }',
      'var x = 1; { var {x: x$__0 = () => x$__0} = {}; }');

  makeTest('Rename in nested destructuring',
      'let x = 1; { let {x: {x}} = {}; }',
      'var x = 1; { var {x: {x: x$__0}} = {}; }');
  makeTest('Rename in nested destructuring 2',
      'let x = 1; { let {x: {x = function x() {}}} = {}; }',
      'var x = 1; { var {x: {x: x$__0 = function x() {}}} = {}; }');

  makeTest('Rename, make sure function name in initializer is not renamed',
      'let x = 1; { let y = function x() {}; }',
      'var x = 1; { var y = function x() {}; }');

  makeTest('Rename, make sure function name in initializer is not renamed 2',
      'let x = 1; { let y = class x {}; }',
      'var x = 1; { var y = class x {}; }');

  makeTest('Siblings',
      '{ let x = 1; }' +
      '{ let x = 2; }' +
      'x;',
      // ======
      '{ var x$__0 = 1; }' +
      '{ var x$__1 = 2; }' +
      'x;');

  makeTest('Siblings 2',
      '{ let x = 1; x; }' +
      '{ let x = 2; x; }' +
      'x;',
      // ======
      '{ var x$__0 = 1; x$__0; }' +
      '{ var x$__1 = 2; x$__1; }' +
      'x;');

  makeTest('Siblings 3',
      'function g() {' +
      '  var zzz = 1;' +
      '  function f() {' +
      '    zzz;' +
      '    {' +
      '      let zzz = 2;' +
      '      zzz;' +
      '    }' +
      '    zzz;' +
      '  }' +
      '}',
      // ======
      'function g() {' +
      '  var zzz = 1;' +
      '  function f() {' +
      '    zzz;' +
      '    {' +
      '      var zzz$__0 = 2;' +
      '      zzz$__0;' +
      '    }' +
      '    zzz;' +
      '  }' +
      '}');

  makeTest('for in',
      'function g() {' +
      '  for (var x in {}) {}' +
      '}',
      // ======
      'function g() {' +
      '  for (var x in {}) {}' +
      '}');

  makeTest('for of',
      'function g() {' +
      '  for (var x of []) {}' +
      '}',
      // ======
      'function g() {' +
      '  for (var x of []) {}' +
      '}');

});

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

suite('VariableBinder.js', function() {

  teardown(function() {
    traceur.options.experimental = false;
  });

  var ErrorReporter = traceur.util.ErrorReporter;
  var Parser = traceur.syntax.Parser;
  var SourceFile = traceur.syntax.SourceFile;
  var b = $traceurRuntime.ModuleStore.getForTesting('src/semantics/VariableBinder');
  var variablesInBlock = b.variablesInBlock;
  var variablesInFunction = b.variablesInFunction;

  function parse(code) {
    var errors = new ErrorReporter();
    var tree = new Parser(new SourceFile('inline', code), errors).parseScript();
    assert.isFalse(errors.hadError());
    assert.equal(1, tree.scriptItemList.length);
    return tree.scriptItemList[0];
  }

  function idsToString(identifiers) {
    return Object.keys(identifiers).sort().join(',');
  }

  test('BoundIdentifiersInBlock', function() {
    traceur.options.experimental = true;
    assert.equal('f', idsToString(variablesInBlock(parse(
        '{ function f(x) { var y; }; }'), false)));
    assert.equal('', idsToString(variablesInBlock(parse(
        '{ var x = function f() {}; }'), false)));
    assert.equal('x', idsToString(variablesInBlock(parse(
        '{ let x = function f() {}; }'), false)));

    // Now set includeFunctionScope = true
    assert.equal('f', idsToString(variablesInBlock(parse(
        '{ function f(x) { var y; }; }'), true)));
    assert.equal('x', idsToString(variablesInBlock(parse(
        '{ var x = function f() {}; }'), true)));
  });

  test('BoundIdentifiersInFunction', function() {
    assert.equal('x,y', idsToString(variablesInFunction(parse(
        'function f(x) { var y; f(); }'))));
    assert.equal('', idsToString(variablesInFunction(parse(
        'function f() { try { } catch (x) { function g(y) { } } }'))));
  });

});

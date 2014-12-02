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

suite('TypeAssertionTransformer.js', function() {

  var TypeAssertionTransformer = $traceurRuntime.ModuleStore.
      getForTesting('src/codegeneration/TypeAssertionTransformer.js').TypeAssertionTransformer;
  var Parser = $traceurRuntime.ModuleStore.
      getForTesting('src/syntax/Parser.js').Parser;
  var SourceFile = $traceurRuntime.ModuleStore.
      getForTesting('src/syntax/SourceFile.js').SourceFile;
  var write = $traceurRuntime.ModuleStore.
      getForTesting('src/outputgeneration/TreeWriter.js').write;
  var ParseTreeValidator = $traceurRuntime.ModuleStore.
      getForTesting('src/syntax/ParseTreeValidator.js').ParseTreeValidator;
  var options = $traceurRuntime.ModuleStore.
      getForTesting('src/Options.js').options;

  setup(function() {
    options.types = true;
    options.typeAssertions = true;
  });

  teardown(function() {
    options.reset();
  });

  function parseExpression(content) {
    var file = new SourceFile('test', content);
    var parser = new Parser(file);
    return parser.parseExpression();
  }

  function testAssertions(code, expected) {
    var tree = parseExpression(code);
    var expectedTree = parseExpression(expected);
    var transformer = new TypeAssertionTransformer(null);
    var transformed = transformer.transformAny(tree);

    assert.equal(write(transformed), write(expectedTree));
  }

  // https://github.com/google/traceur-compiler/issues/1443
  test('Arrow function with body', function() {
    var code =
      'function test():string {\n' +
      '  var a = () => { return 0;};\n' +
      '  a();\n' +
      '  return "str";\n' +
      '}';

    var expected =
      'function test():string {\n' +
      '  var a = () => { return 0;};\n' +
      '  a();\n' +
      '  return assert.returnType(("str"), string);\n' +
      '}';

    testAssertions(code, expected);
  });

  // https://github.com/google/traceur-compiler/issues/1443
  test('Arrow function with concise body', function() {
    var code =
      'function test():string {\n' +
      '  var a = () => 0;\n' +
      '  a();\n' +
      '  return "str";\n' +
      '}';

    var expected =
      'function test():string {\n' +
      '  var a = () => 0;\n' +
      '  a();\n' +
      '  return assert.returnType(("str"), string);\n' +
      '}';

    testAssertions(code, expected);
  });
});

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

import {suite, test, assert} from '../../unit/unitTestRunner.js';

suite('MemberVariableTransformer.js', function() {
  var MemberVariableTransformer = $traceurRuntime.ModuleStore.
    getForTesting('src/codegeneration/MemberVariableTransformer.js').MemberVariableTransformer;
  var UniqueIdentifierGenerator = $traceurRuntime.ModuleStore.
    getForTesting('src/codegeneration/UniqueIdentifierGenerator.js').UniqueIdentifierGenerator;
  var Parser = $traceurRuntime.ModuleStore.
    getForTesting('src/syntax/Parser.js').Parser;
  var SourceFile = $traceurRuntime.ModuleStore.
    getForTesting('src/syntax/SourceFile.js').SourceFile;
  var write = $traceurRuntime.ModuleStore.
    getForTesting('src/outputgeneration/TreeWriter.js').write;
  var ParseTreeValidator = $traceurRuntime.ModuleStore.
    getForTesting('src/syntax/ParseTreeValidator.js').ParseTreeValidator;
  var Options = $traceurRuntime.ModuleStore.
    getForTesting('src/Options.js').Options;
  var ErrorReporter = $traceurRuntime.ModuleStore.
      getForTesting('src/util/CollectingErrorReporter.js').CollectingErrorReporter;

  function parseExpression(content, options) {
    var file = new SourceFile('test', content);
    var parser = new Parser(file, undefined, options);
    return parser.parseExpression();
  }

  function parseFunction(content, options) {
    return parseExpression('function() {' + content + '}', options);
  }

  function normalize(content, options) {
    var tree = parseExpression('function() {' + content + '}', options).body;
    return write(tree, options);
  }

  function makeTest(name, opts, code, expected) {
    test(name, function() {
      var options = new Options();
      options.setFromObject(opts);

      var tree = parseFunction(code, options);
      var reporter = new ErrorReporter();
      var transformer = new MemberVariableTransformer(
          new UniqueIdentifierGenerator(), reporter, tree);
      var transformed = transformer.transformAny(tree);
      new ParseTreeValidator().visitAny(transformed);
      assert.equal(write(transformed.body, options), normalize(expected, options));
      assert.lengthOf(reporter.errors, 0);
    });
  }

  function extend(base, extra) {
    Object.keys(extra).forEach(function(k) {
      base[k] = extra[k];
    });
    return base;
  }

  const BASIC_OPTIONS = {
    types: true,
    annotations: true,
    memberVariables: true,
    outputLanguage: 'es6'
  };

  makeTest('typed member variables', BASIC_OPTIONS,
           'class C {\n' +
           '  value:string;\n' +
           '}\n',
           'class C {\n' +
           '  get value() : string{\n' +
           '    return this.$__0;\n' +
           '  }\n' +
           '  set value(value: string) {\n' +
           '    this.$__0 = value;\n' +
           '  }\n' +
           '}\n');
});

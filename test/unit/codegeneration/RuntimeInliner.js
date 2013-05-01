// Copyright 2012 Traceur Authors.
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

suite('RuntimeInliner.js', function() {

  setup(function() {
    traceur.options.reset(true);
    traceur.options.spread = true;
  });

  teardown(function() {
    traceur.options.reset();
  });

  var expextedResult = '\n\
      var $__toObject = function(value) {\n\
        if (value == null) throw TypeError();\n\
        return Object(value);\n\
      }, $__spread = function() {\n\
        var rv = [], k = 0;\n\
        for (var i = 0; i < arguments.length; i++) {\n\
          var value = $__toObject(arguments[i]);\n\
          for (var j = 0; j < value.length; j++) {\n\
            rv[k++] = value[j];\n\
          }\n\
        }\n\
        return rv;\n\
      };\n\
      var a = $__spread([0, 1]);\n\
      var b = $__spread(a, [2]);\n\
      ';

  var ProjectWriter = traceur.outputgeneration.ProjectWriter;

  function normalize(s) {
    return s.trim().replace(/(\s+\n)|(\n\s+)/g, '\n');
  }

  test('TwoProprams', function() {
    var url = 'http://www.test.com/';
    var project = new traceur.semantics.symbols.Project(url);

    var sourceA = 'var a = [...[0, 1]];'
    var fileA = new traceur.syntax.SourceFile('a', sourceA);
    project.addFile(fileA);

    var sourceB = 'var b = [...a, 2];'
    var fileB = new traceur.syntax.SourceFile('b', sourceB);
    project.addFile(fileB);

    var reporter = new traceur.util.ErrorReporter();

    var res = traceur.codegeneration.Compiler.compile(reporter, project, false);

    var expectedResult = normalize(expextedResult);
    var actualResult = normalize(ProjectWriter.write(res));

    assert.equal(expectedResult, actualResult);
  })

});
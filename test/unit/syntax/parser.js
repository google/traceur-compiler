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

suite('parser.js', function() {
  var errorReporter = {
    reportError: function(position, message) {
      throw new chai.AssertionError({message: message + ', ' + position});
    }
  };

  test('Module', function() {
    var program = 'module Foo { export var x = 42; ' +
                    'module M from \'url\'; ' +
                    'import z from \'x\'.y; ' +
                    'import * from M; ' +
                    'import {a:b,c} from M.x;' +
                  '};\n';
    var sourceFile = new traceur.syntax.SourceFile('Name', program);
    var parser = new traceur.syntax.Parser(errorReporter, sourceFile);

    parser.parseProgram(true);
  });

});
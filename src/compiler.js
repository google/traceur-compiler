// Copyright 2011 Google Inc.
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

traceur.define('', function() {
  'use strict';

  function Compiler() {
  }
  
  Compiler.prototype.compile = function(scriptName, script) {
    var errors = new traceur.util.ErrorReporter();    
    var sourceFile = new traceur.syntax.SourceFile(scriptName, script);
    var parser = new traceur.syntax.Parser(errors, sourceFile);
    var tree = parser.parseProgram();
  
    if (errors.length > 0) {
      return { result: null, errors: errors };
    }
    
    // TODO: transform
    
    // Write out
    var result = traceur.codegeneration.ParseTreeWriter.write(tree);
    
    return { result: result, errors: errors };
  };
  
  return {
    Compiler: Compiler
  };
});
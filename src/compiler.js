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

    if (errors.hadError()) {
      return { result: null, errors: errors };
    }

    //TODO(jmesserly): traceur.syntax.ParseTreeValidator.validate(tree);
    tree = traceur.codegeneration.ClassTransformer.transformClasses(errors, tree);
    if (errors.hadError()) {
      return { result: null, errors: errors };
    }

    var idGen = new traceur.codegeneration.UniqueIdentifierGenerator();

    //TODO(jmesserly): traceur.syntax.ParseTreeValidator.validate(tree);
    tree = traceur.codegeneration.ForEachTransformer.transformTree(idGen, tree);
    if (errors.hadError()) {
      return { result: null, errors: errors };
    }

    //TODO(jmesserly): traceur.syntax.ParseTreeValidator.validate(tree);
    tree = traceur.codegeneration.GeneratorTransformPass.transformTree(
        idGen, errors, tree);
    if (errors.hadError()) {
      return { result: null, errors: errors };
    }

    // destructuring must come after foreach and before block binding
    //TODO(jmesserly): traceur.syntax.ParseTreeValidator.validate(tree);
    tree = traceur.codegeneration.DestructuringTransformer.transformTree(tree);
    if (errors.hadError()) {
      return { result: null, errors: errors };
    }

    // Write out
    //TODO(jmesserly): traceur.syntax.ParseTreeValidator.validate(tree);
    var result = traceur.codegeneration.ParseTreeWriter.write(tree, false);
    return { result: result, errors: errors };
  };

  return {
    Compiler: Compiler
  };
});

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

var traceur = (function() {
  'use strict';

  /**
   * Builds an object structure for the provided namespace path,
   * ensuring that names that already exist are not overwritten. For
   * example:
   * "a.b.c" -> a = {};a.b={};a.b.c={};
   * @param {string} name Name of the object that this file defines.
   * @private
   */
  function exportPath(name) {
    var parts = name.split('.');
    var cur = traceur;

    for (var part; parts.length && (part = parts.shift());) {
      if (part in cur) {
        cur = cur[part];
      } else {
        cur = cur[part] = {};
      }
    }
    return cur;
  };

  /**
   * @param {string} name
   * @param {!Function} fun
   */
  function define(name, fun) {
    var obj = exportPath(name);
    var exports = fun();
    for (var propertyName in exports) {
      // Maybe we should check the prototype chain here? The current usage
      // pattern is always using an object literal so we only care about own
      // properties.
      var propertyDescriptor = Object.getOwnPropertyDescriptor(exports,
                                                               propertyName);
      if (propertyDescriptor)
        Object.defineProperty(obj, propertyName, propertyDescriptor);
    }
  }

  function assert(b) {
    if (!b)
      throw Error('Assertion failed');
  }

  // Cached path to the current script file in an HTML hosting environment.
  var path;

  // Use comma expression to use global eval.
  var global = ('global', eval)('this');

  // Allow script before this one to define a global importScript function.
  var importScript = global.importScript || function(file) {
    if (!path) {
      // Find path to this js file
      var scripts = document.querySelectorAll('script');
      var src = scripts[scripts.length - 1].src;
      path = src.substring(0, src.lastIndexOf('/') + 1);
    }

    document.write('<script src="' + path + file + '"></script>');
  };

  global.traceur = {
    define: define,
    assert: assert
  };

  var scripts = [
    'compiler.js',
    'util/SourceRange.js',
    'util/SourcePosition.js',
    'syntax/Token.js',
    'syntax/TokenType.js',
    'syntax/LiteralToken.js',
    'syntax/IdentifierToken.js',
    'syntax/Keywords.js',
    'syntax/LineNumberTable.js',
    'syntax/SourceFile.js',
    'syntax/Scanner.js',
    'syntax/PredefinedName.js',
    'syntax/trees/ParseTreeType.js',
    'syntax/trees/ParseTree.js',
    'syntax/trees.js',
    'syntax/trees/ImportPathTree.js',
    'syntax/trees/NullTree.js',
    'util/ErrorReporter.js',
    'util/MutedErrorReporter.js',
    'syntax/Parser.js',
    'syntax/ParseTreeVisitor.js',
    'syntax/ParseTreeValidator.js',
    'util/StringBuilder.js',
    'semantics/BoundIdentifierAccumulator.js',
    'codegeneration/ParseTreeWriter.js',
    'codegeneration/ParseTreeFactory.js',
    'codegeneration/ParseTreeTransformer.js',
    'codegeneration/DefaultParametersTransformer.js',
    'codegeneration/RestParameterTransformer.js',
    'codegeneration/SpreadTransformer.js',
    'codegeneration/UniqueIdentifierGenerator.js',
    'codegeneration/ForEachTransformer.js',
    'codegeneration/generator/ForInTransformPass.js',
    'codegeneration/generator/State.js',
    'codegeneration/generator/FallThroughState.js',
    'codegeneration/generator/TryState.js',
    'codegeneration/generator/BreakState.js',
    'codegeneration/generator/CatchState.js',
    'codegeneration/generator/ConditionalState.js',
    'codegeneration/generator/ContinueState.js',
    'codegeneration/generator/EndState.js',
    'codegeneration/generator/FinallyFallThroughState.js',
    'codegeneration/generator/FinallyState.js',
    'codegeneration/generator/SwitchState.js',
    'codegeneration/generator/YieldState.js',
    'codegeneration/generator/StateAllocator.js',
    'codegeneration/generator/StateMachineTree.js',
    'codegeneration/generator/BreakContinueTransformer.js',
    'codegeneration/generator/CPSTransformer.js',
    'codegeneration/generator/GeneratorTransformer.js',
    'codegeneration/generator/AsyncTransformer.js',
    'codegeneration/GeneratorTransformPass.js'
  ];
  scripts.forEach(importScript);

  return global.traceur;
})();

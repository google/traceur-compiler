// Copyright 2012 Google Inc.
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

module traceur {
  var global = this;

  // TODO(arv): Remove this hack.
  var traceurRuntime = global.traceur.runtime;
  export var runtime = traceurRuntime;

  import options from 'options.js';
  export options;

  import createObject from 'util/util.js';
  export createObject;

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
  }

  /**
   * Generates an identifier string that represents a URL.
   * @param {string} url
   * @param {string} commonPath
   * @return {string}
   */
  export function generateNameForUrl(url, commonPath) {
    return '$__' + url.replace(commonPath, '').replace(/[^\d\w$]/g, '_');
  }

  /**
   * Returns the module object for a module file relative to the src/ directory.
   * This relies on the internal temporary name of the module so it should only
   * be used when testing.
   *
   * Example:
   *   getModuleForTesting('semantics/FreeVariableChecker.js')
   *
   * @param {string} path Path to the module relative to src/.
   */
  export function getModuleForTesting(path) {
    return global[generateNameForUrl(`src/${path}`, '')];
  }

  /**
   * @param {string} name
   * @param {!Function} fun
   */
  export function define(name, fun) {
    var obj = exportPath(name);
    var exports = fun();
    for (var name in exports) {
      // Maybe we should check the prototype chain here? The current usage
      // pattern is always using an object literal so we only care about own
      // properties.
      var propertyDescriptor = Object.getOwnPropertyDescriptor(exports, name);
      if (propertyDescriptor)
        Object.defineProperty(obj, name, propertyDescriptor);
    }
  }

  export function assert(b) {
    if (!b && options.debug)
      throw Error('Assertion failed');
  }

  /**
   * Evaluates some code in a strict global context.
   * @param {string} code
   * @return {*} The continuation value of the code.
   */
  export function strictGlobalEval(code) {
    return ('global', eval)('"use strict";' + code);
  }

  var uidCounter = 0;

  /**
   * Returns a new unique ID.
   * @return {number}
   */
  export function getUid() {
    return ++uidCounter;
  }

  export module semantics {
    import ModuleAnalyzer from 'semantics/ModuleAnalyzer.js';
    export ModuleAnalyzer;

    export module symbols {
      import Project from 'semantics/symbols/Project.js';
      export Project;
    }

    import VariableBinder from 'semantics/VariableBinder.js';
    export VariableBinder;

    import evaluateStringLiteral from 'semantics/util.js';
    export evaluateStringLiteral;
  }

  export module util {
    import {canonicalizeUrl, resolveUrl} from 'util/url.js';
    export canonicalizeUrl, resolveUrl;

    import ErrorReporter from 'util/ErrorReporter.js';
    export ErrorReporter;

    import TestErrorReporter from 'util/TestErrorReporter.js';
    export TestErrorReporter;

    import SourcePosition from 'util/SourcePosition.js';
    export SourcePosition;

    import MutedErrorReporter from 'util/MutedErrorReporter.js';
    export MutedErrorReporter;

    import removeDotSegments from 'util/url.js';
    export removeDotSegments;
  }

  export module syntax {
    import Scanner from 'syntax/Scanner.js';
    export Scanner;

    import SourceFile from 'syntax/SourceFile.js';
    export SourceFile;

    // TODO(arv): When we have support for export * we can remove the hacks
    // related to how we exprort things inside ParseTrees.js.
    export module trees from 'syntax/trees/ParseTrees.js';

    import Parser from 'syntax/Parser.js';
    export Parser;

    import Token from 'syntax/Token.js';
    export Token;

    import TokenType from 'syntax/TokenType.js';
    export TokenType;

    import IdentifierToken from 'syntax/IdentifierToken.js';
    export IdentifierToken;

    import LiteralToken from 'syntax/LiteralToken.js';
    export LiteralToken;

    import ParseTreeValidator from 'syntax/ParseTreeValidator.js';
    export ParseTreeValidator;
  }

  export module outputgeneration {
    import ProjectWriter from 'outputgeneration/ProjectWriter.js';
    export ProjectWriter;

    import TreeWriter from 'outputgeneration/TreeWriter.js';
    export TreeWriter;

    import SourceMapConsumer from 'outputgeneration/SourceMapIntegration.js';
    export SourceMapConsumer;

    import SourceMapGenerator from 'outputgeneration/SourceMapIntegration.js';
    export SourceMapGenerator;
  }

  export module codegeneration {
    export module ParseTreeFactory from 'codegeneration/ParseTreeFactory.js';

    export module module {
      import ModuleRequireVisitor from 'codegeneration/module/ModuleRequireVisitor.js';
      export ModuleRequireVisitor;
    }

    import ParseTreeTransformer from 'codegeneration/ParseTreeTransformer.js';
    export ParseTreeTransformer;

    import ModuleTransformer from 'codegeneration/ModuleTransformer.js';
    export ModuleTransformer;

    import ProgramTransformer from 'codegeneration/ProgramTransformer.js';
    export ProgramTransformer;

    import Compiler from 'codegeneration/Compiler.js';
    export Compiler;
  }

  import {internals, getModuleInstanceByUrl, CodeLoader} from 'runtime/modules.js';
  runtime.internals = internals;
  runtime.getModuleInstanceByUrl = getModuleInstanceByUrl;
  runtime.CodeLoader = CodeLoader;
}

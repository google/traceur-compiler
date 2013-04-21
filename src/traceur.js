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

module traceur {
  var global = this;

  import {options} from './options.js';
  export options;

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
    return global[generateNameForUrl(`../src/${path}`, './')];
  }

  export function assert(b) {
    if (!b && options.debug)
      throw Error('Assertion failed');
  }

  export WebPageProject from './WebPageProject.js';

  export module semantics {
    export FreeVariableChecker from './semantics/FreeVariableChecker.js';
    export ModuleAnalyzer from './semantics/ModuleAnalyzer.js';
    export VariableBinder from './semantics/VariableBinder.js';

    export module symbols {
      export Project from './semantics/symbols/Project.js';
    }
  }

  export module util {
    export ErrorReporter from './util/ErrorReporter.js';
    export MutedErrorReporter from './util/MutedErrorReporter.js';
    export SourcePosition from './util/SourcePosition.js';
    export TestErrorReporter from './util/TestErrorReporter.js';
    export {canonicalizeUrl, resolveUrl} from './util/url.js';
    export removeDotSegments from './util/url.js';
  }

  export module syntax {
    export IdentifierToken from './syntax/IdentifierToken.js';
    export LiteralToken from './syntax/LiteralToken.js';
    export Parser from './syntax/Parser.js';
    export ParseTreeValidator from './syntax/ParseTreeValidator.js';
    export ParseTreeVisitor from './syntax/ParseTreeVisitor.js';
    export Scanner from './syntax/Scanner.js';
    export SourceFile from './syntax/SourceFile.js';
    export Token from './syntax/Token.js';
    export module TokenType from './syntax/TokenType.js';

    export module trees {
      export * from './syntax/trees/ParseTrees.js';
      export ParseTree from './syntax/trees/ParseTree.js';
      export module ParseTreeType from './syntax/trees/ParseTreeType.js';
    }
  }

  export module outputgeneration {
    export ParseTreeWriter from './outputgeneration/ParseTreeWriter.js';
    export ParseTreeMapWriter from './outputgeneration/ParseTreeMapWriter.js';
    export ProjectWriter from './outputgeneration/ProjectWriter.js';
    export SourceMapConsumer from './outputgeneration/SourceMapIntegration.js';
    export SourceMapGenerator from './outputgeneration/SourceMapIntegration.js';
    export TreeWriter from './outputgeneration/TreeWriter.js';
  }

  export module codegeneration {
    export Compiler from './codegeneration/Compiler.js';
    export ModuleTransformer from './codegeneration/ModuleTransformer.js';
    export ParseTreeTransformer from './codegeneration/ParseTreeTransformer.js';
    export ProgramTransformer from './codegeneration/ProgramTransformer.js';
    export CloneTreeTransformer from './codegeneration/CloneTreeTransformer.js';
    export module ParseTreeFactory from './codegeneration/ParseTreeFactory.js';

    export {
      parseExpression,
      parseStatement
    } from './codegeneration/PlaceholderParser.js';

    export module module {
      export ModuleRequireVisitor from
          './codegeneration/module/ModuleRequireVisitor.js';
    }
  }

  export module modules from './runtime/modules.js';
}

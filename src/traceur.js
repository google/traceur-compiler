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

  export {options} from './options.js';

  export {WebPageProject} from './WebPageProject.js';

  export module semantics {
    export {ModuleAnalyzer} from './semantics/ModuleAnalyzer.js';

    export module symbols {
      export {Project} from './semantics/symbols/Project.js';
    }
  }

  export module util {
    export {ErrorReporter} from './util/ErrorReporter.js';
    export {SourcePosition} from './util/SourcePosition.js';
    export {TestErrorReporter} from './util/TestErrorReporter.js';
    export {resolveUrl} from './util/url.js';
  }

  export module syntax {
    export {IdentifierToken} from './syntax/IdentifierToken.js';
    export {LiteralToken} from './syntax/LiteralToken.js';
    export {Parser} from './syntax/Parser.js';
    export {Scanner} from './syntax/Scanner.js';
    export {SourceFile} from './syntax/SourceFile.js';
    export {Token} from './syntax/Token.js';
    export module TokenType from './syntax/TokenType.js';

    export module trees {
      export * from './syntax/trees/ParseTrees.js';
      export {ParseTree} from './syntax/trees/ParseTree.js';
    }
  }

  export module outputgeneration {
    export {ParseTreeWriter} from './outputgeneration/ParseTreeWriter.js';
    export {ParseTreeMapWriter} from './outputgeneration/ParseTreeMapWriter.js';
    export {ProjectWriter} from './outputgeneration/ProjectWriter.js';
    export {SourceMapConsumer} from './outputgeneration/SourceMapIntegration.js';
    export {SourceMapGenerator} from './outputgeneration/SourceMapIntegration.js';
    export {TreeWriter} from './outputgeneration/TreeWriter.js';
  }

  export module codegeneration {
    export {Compiler} from './codegeneration/Compiler.js';
    export {ModuleTransformer} from './codegeneration/ModuleTransformer.js';
    export {ParseTreeTransformer} from './codegeneration/ParseTreeTransformer.js';
    export {ProgramTransformer} from './codegeneration/ProgramTransformer.js';
    export {CloneTreeTransformer} from './codegeneration/CloneTreeTransformer.js';
    export module ParseTreeFactory from './codegeneration/ParseTreeFactory.js';

    export module module {
      export {ModuleRequireVisitor} from
          './codegeneration/module/ModuleRequireVisitor.js';
    }
  }

  export module modules from './runtime/module-loader.js';
}

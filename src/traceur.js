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

export {options} from './options.js';

export {WebPageProject} from './WebPageProject.js';

import {ModuleAnalyzer} from './semantics/ModuleAnalyzer.js';
import {Project} from './semantics/symbols/Project.js';

export var semantics = {
  ModuleAnalyzer,
  symbols: {
    Project
  }
};

import {ErrorReporter} from './util/ErrorReporter.js';
import {SourcePosition} from './util/SourcePosition.js';
import {TestErrorReporter} from './util/TestErrorReporter.js';
import {resolveUrl} from './util/url.js';

export var util = {
  ErrorReporter,
  SourcePosition,
  TestErrorReporter,
  resolveUrl
};

import {IdentifierToken} from './syntax/IdentifierToken.js';
import {LiteralToken} from './syntax/LiteralToken.js';
import {Parser} from './syntax/Parser.js';
import {Scanner} from './syntax/Scanner.js';
import {SourceFile} from './syntax/SourceFile.js';
import {Token} from './syntax/Token.js';
module TokenType from './syntax/TokenType.js';
module trees from './syntax/trees/ParseTrees.js';

export var syntax = {
  IdentifierToken,
  LiteralToken,
  Parser,
  Scanner,
  SourceFile,
  Token,
  TokenType,
  trees
};

import {ParseTreeWriter} from './outputgeneration/ParseTreeWriter.js';
import {ParseTreeMapWriter} from './outputgeneration/ParseTreeMapWriter.js';
import {ProjectWriter} from './outputgeneration/ProjectWriter.js';
import {SourceMapConsumer} from './outputgeneration/SourceMapIntegration.js';
import {SourceMapGenerator} from './outputgeneration/SourceMapIntegration.js';
import {TreeWriter} from './outputgeneration/TreeWriter.js';

export var outputgeneration = {
  ParseTreeWriter,
  ParseTreeMapWriter,
  ProjectWriter,
  SourceMapConsumer,
  SourceMapGenerator,
  TreeWriter
};

import {Compiler} from './codegeneration/Compiler.js';
import {ModuleTransformer} from './codegeneration/ModuleTransformer.js';
import {ParseTreeTransformer} from './codegeneration/ParseTreeTransformer.js';
import {ProgramTransformer} from './codegeneration/ProgramTransformer.js';
import {CloneTreeTransformer} from './codegeneration/CloneTreeTransformer.js';
module ParseTreeFactory from './codegeneration/ParseTreeFactory.js';
import {ModuleRequireVisitor} from './codegeneration/module/ModuleRequireVisitor.js';

export var codegeneration = {
  Compiler,
  ModuleTransformer,
  ParseTreeTransformer,
  ProgramTransformer,
  CloneTreeTransformer,
  ParseTreeFactory,
  module: {
    ModuleRequireVisitor
  }
};

module modules from './runtime/module-loader.js';
export {modules};

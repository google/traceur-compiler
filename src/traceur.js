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

export {options} from './options';

export {WebPageProject} from './WebPageProject';

import {ModuleAnalyzer} from './semantics/ModuleAnalyzer';
import {Project} from './semantics/symbols/Project';

export var semantics = {
  ModuleAnalyzer,
  symbols: {
    Project
  }
};

import {ErrorReporter} from './util/ErrorReporter';
import {SourcePosition} from './util/SourcePosition';
import {TestErrorReporter} from './util/TestErrorReporter';
import {resolveUrl} from './util/url';

export var util = {
  ErrorReporter,
  SourcePosition,
  TestErrorReporter,
  resolveUrl
};

import {IdentifierToken} from './syntax/IdentifierToken';
import {LiteralToken} from './syntax/LiteralToken';
import {Parser} from './syntax/Parser';
import {Scanner} from './syntax/Scanner';
import {SourceFile} from './syntax/SourceFile';
import {Token} from './syntax/Token';
module TokenType from './syntax/TokenType';
module trees from './syntax/trees/ParseTrees';

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

import {ParseTreeWriter} from './outputgeneration/ParseTreeWriter';
import {ParseTreeMapWriter} from './outputgeneration/ParseTreeMapWriter';
import {ProjectWriter} from './outputgeneration/ProjectWriter';
import {SourceMapConsumer} from './outputgeneration/SourceMapIntegration';
import {SourceMapGenerator} from './outputgeneration/SourceMapIntegration';
import {TreeWriter} from './outputgeneration/TreeWriter';

export var outputgeneration = {
  ParseTreeWriter,
  ParseTreeMapWriter,
  ProjectWriter,
  SourceMapConsumer,
  SourceMapGenerator,
  TreeWriter
};

import {Compiler} from './codegeneration/Compiler';
import {ModuleTransformer} from './codegeneration/ModuleTransformer';
import {ParseTreeTransformer} from './codegeneration/ParseTreeTransformer';
import {ProgramTransformer} from './codegeneration/ProgramTransformer';
import {CloneTreeTransformer} from './codegeneration/CloneTreeTransformer';
module ParseTreeFactory from './codegeneration/ParseTreeFactory';
import {ModuleRequireVisitor} from './codegeneration/module/ModuleRequireVisitor';

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

module modules from './runtime/module-loader';
export {modules};

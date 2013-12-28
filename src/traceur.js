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

export {WebPageTranscoder} from './WebPageTranscoder';

import {ModuleAnalyzer} from './semantics/ModuleAnalyzer';

export var semantics = {
  ModuleAnalyzer,
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

import {ParseTreeMapWriter} from './outputgeneration/ParseTreeMapWriter';
import {ParseTreeWriter} from './outputgeneration/ParseTreeWriter';
import {SourceMapConsumer} from './outputgeneration/SourceMapIntegration';
import {SourceMapGenerator} from './outputgeneration/SourceMapIntegration';
import {TreeWriter} from './outputgeneration/TreeWriter';

export var outputgeneration = {
  ParseTreeMapWriter,
  ParseTreeWriter,
  SourceMapConsumer,
  SourceMapGenerator,
  TreeWriter
};

import {AmdTransformer} from './codegeneration/AmdTransformer';
import {CloneTreeTransformer} from './codegeneration/CloneTreeTransformer';
import {CommonJsModuleTransformer} from './codegeneration/CommonJsModuleTransformer';
import {FromOptionsTransformer} from './codegeneration/FromOptionsTransformer';
import {ModuleSpecifierVisitor} from './codegeneration/module/ModuleSpecifierVisitor';
import {ModuleTransformer} from './codegeneration/ModuleTransformer';
import {ParseTreeTransformer} from './codegeneration/ParseTreeTransformer';
module ParseTreeFactory from './codegeneration/ParseTreeFactory';

export var codegeneration = {
  AmdTransformer,
  CloneTreeTransformer,
  CommonJsModuleTransformer,
  FromOptionsTransformer,
  ModuleTransformer,
  ParseTreeFactory,
  ParseTreeTransformer,
  module: {
    ModuleSpecifierVisitor
  }
};

module modules from './runtime/Loader';
export {modules};

import {InterceptOutputLoaderHooks} from './runtime/InterceptOutputLoaderHooks';
export var runtime = {
  InterceptOutputLoaderHooks
}

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

// Used by unit tests only
import './util/MutedErrorReporter.js';

export {ModuleStore} from '@traceur/src/runtime/ModuleStore.js';
export {WebPageTranscoder} from './WebPageTranscoder.js';
export {HTMLImportTranscoder} from './HTMLImportTranscoder.js';
import {addOptions, CommandOptions, Options} from './Options.js';

import {ModuleStore} from '@traceur/src/runtime/ModuleStore.js';

export function get(name) {
  return ModuleStore.get(ModuleStore.normalize('./' + name, __moduleName));
}

export {Compiler} from './Compiler.js';

import {ErrorReporter} from './util/ErrorReporter.js';
import {CollectingErrorReporter} from './util/CollectingErrorReporter.js';

export let util = {
  addOptions,
  CommandOptions,
  CollectingErrorReporter,
  ErrorReporter,
  Options
};

import {Parser} from './syntax/Parser.js';
import {Script} from './syntax/trees/ParseTrees.js';
import {SourceFile} from './syntax/SourceFile.js';

export let syntax = {
  Parser,
  SourceFile,
  trees: {
    Script
  }
};

import {ParseTreeMapWriter} from './outputgeneration/ParseTreeMapWriter.js';
import {ParseTreeWriter} from './outputgeneration/ParseTreeWriter.js';
import {regexpuRewritePattern} from './outputgeneration/regexpuRewritePattern.js';
import {SourceMapConsumer} from './outputgeneration/SourceMapIntegration.js';
import {SourceMapGenerator} from './outputgeneration/SourceMapIntegration.js';
import {TreeWriter} from './outputgeneration/TreeWriter.js';

export let outputgeneration = {
  ParseTreeMapWriter,
  ParseTreeWriter,
  regexpuRewritePattern,
  SourceMapConsumer,
  SourceMapGenerator,
  TreeWriter
};

import {AttachModuleNameTransformer} from './codegeneration/module/AttachModuleNameTransformer.js';
import {CloneTreeTransformer} from './codegeneration/CloneTreeTransformer.js';
import {FromOptionsTransformer} from './codegeneration/FromOptionsTransformer.js';
import {PureES6Transformer} from './codegeneration/PureES6Transformer.js';
import {createModuleEvaluationStatement} from './codegeneration/module/createModuleEvaluationStatement.js';
import {parseExpression, parseModule, parseScript, parseStatement} from './codegeneration/PlaceholderParser.js';

export let codegeneration = {
  CloneTreeTransformer,
  FromOptionsTransformer,
  PureES6Transformer,
  parseExpression,
  parseModule,
  parseScript,
  parseStatement,
  module: {
    AttachModuleNameTransformer,
    createModuleEvaluationStatement
  }
};

import {Loader} from './runtime/Loader.js';
import {LoaderCompiler} from './runtime/LoaderCompiler.js';
import {BrowserTraceurLoader} from './runtime/TraceurLoader.js';
import {NodeLoaderCompiler} from './node/NodeLoaderCompiler.js';
import {InlineLoaderCompiler} from './runtime/InlineLoaderCompiler.js';
import {NodeTraceurLoader} from './runtime/NodeTraceurLoader.js';
import {TraceurLoader} from './runtime/TraceurLoader.js';

export let runtime = {
  BrowserTraceurLoader,
  InlineLoaderCompiler,
  Loader,
  LoaderCompiler,
  NodeLoaderCompiler,
  NodeTraceurLoader,
  TraceurLoader
};

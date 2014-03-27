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

import './runtime/System';

export {ModuleStore} from '@traceur/src/runtime/ModuleStore';
export {System};
export {WebPageTranscoder} from './WebPageTranscoder';
export {options} from './options';

import {ErrorReporter} from './util/ErrorReporter';
import {TestErrorReporter} from './util/TestErrorReporter';

export var util = {
  ErrorReporter,
  TestErrorReporter
};

import {Parser} from './syntax/Parser';
import {Scanner} from './syntax/Scanner';
import {Script} from './syntax/trees/ParseTrees';
import {SourceFile} from './syntax/SourceFile';

export var syntax = {
  Parser,
  Scanner,
  SourceFile,
  trees: {
    Script
  }
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

import {AttachModuleNameTransformer} from './codegeneration/module/AttachModuleNameTransformer';
import {CloneTreeTransformer} from './codegeneration/CloneTreeTransformer';
import {FromOptionsTransformer} from './codegeneration/FromOptionsTransformer';
import {createModuleEvaluationStatement} from './codegeneration/module/createModuleEvaluationStatement';

export var codegeneration = {
  CloneTreeTransformer,
  FromOptionsTransformer,
  module: {
    AttachModuleNameTransformer,
    createModuleEvaluationStatement
  }
};

import {Loader} from './runtime/Loader';
import {LoaderHooks} from './runtime/LoaderHooks';
import {InterceptOutputLoaderHooks} from './runtime/InterceptOutputLoaderHooks';
import {TraceurLoader} from './runtime/TraceurLoader';

export var runtime = {
  InterceptOutputLoaderHooks,
  Loader,
  LoaderHooks,
  TraceurLoader
}

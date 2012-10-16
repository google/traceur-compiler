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

// This file makes sure we can access certain modules as objects of traceur.

// TODO(arv): This should just go into traceur.js

// module semantics {
//   import ModuleAnalyzer from 'semantics/ModuleAnalyzer.js';
//   export ModuleAnalyzer;

//   export module symbols {
//     import Project from 'semantics/symbols/Project.js';
//     export Project;
//   }
// }

// module util {
//   import {canonicalizeUrl, resolveUrl} from 'util/url.js';
//   export canonicalizeUrl, resolveUrl;

//   import evaluateStringLiteral from 'util/util.js';
//   export evaluateStringLiteral;

//   import ErrorReporter from 'util/ErrorReporter.js';
//   export ErrorReporter;

//   import TestErrorReporter from 'util/TestErrorReporter.js';
//   export TestErrorReporter;
// }

// module syntax {
//   import Scanner from 'syntax/Scanner.js';
//   export Scanner;

//   import SourceFile from 'syntax/SourceFile.js';
//   export SourceFile;

//   import trees from 'syntax/trees/ParseTrees.js';
//   export trees;

//   import Parser from 'syntax/Parser.js';
//   export Parser;

//   import Token from 'syntax/Token.js';
//   export Token;

//   import TokenType from 'syntax/TokenType.js';
//   export TokenType;
// }

// module outputgeneration {
//   import ProjectWriter from 'outputgeneration/ProjectWriter.js';
//   export ProjectWriter;

//   import TreeWriter from 'outputgeneration/TreeWriter.js';
//   export TreeWriter;

//   import SourceMapConsumer from 'outputgeneration/SourceMapIntegration.js';
//   export SourceMapConsumer;

//   import SourceMapGenerator from 'outputgeneration/SourceMapIntegration.js';
//   export SourceMapGenerator;
// }

// module codegeneration {
//   import ParseTreeFactory from 'codegeneration/ParseTreeFactory.js';
//   export ParseTreeFactory;

//   export module module {
//     import ModuleRequireVisitor from 'codegeneration/module/ModuleRequireVisitor.js';
//     export ModuleRequireVisitor;
//   }

//   import ParseTreeTransformer from 'codegeneration/ParseTreeTransformer.js';
//   export ParseTreeTransformer;

//   import ModuleTransformer from 'codegeneration/ModuleTransformer.js';
//   export ModuleTransformer;

//   import ProgramTransformer from 'codegeneration/ProgramTransformer.js';
//   export ProgramTransformer;

//   import Compiler from 'codegeneration/Compiler.js';
//   export Compiler;
// }

// traceur.semantics = semantics;
// traceur.util = util;
// traceur.syntax = syntax;
// traceur.outputgeneration = outputgeneration;
// traceur.codegeneration = codegeneration;

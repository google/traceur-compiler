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

'use strict';

var includes = [
  // We assume we're always relative to "src/"
  '../third_party/source-map/lib/source-map/array-set.js',
  '../third_party/source-map/lib/source-map/base64.js',
  '../third_party/source-map/lib/source-map/base64-vlq.js',
  '../third_party/source-map/lib/source-map/binary-search.js',
  '../third_party/source-map/lib/source-map/util.js',
  '../third_party/source-map/lib/source-map/source-map-generator.js',
  '../third_party/source-map/lib/source-map/source-map-consumer.js',
  '../third_party/source-map/lib/source-map/source-node.js',
  'traceur.js',
  'outputgeneration/SourceMapIntegration.js',
  'options.js',
  'util/util.js',
  'util/ArrayMap.js',
  'util/ObjectMap.js',
  'util/SourceRange.js',
  'util/SourcePosition.js',
  'util/url.js',
  'syntax/TokenType.js',
  'syntax/Token.js',
  'syntax/AtNameToken.js',
  'syntax/LiteralToken.js',
  'syntax/IdentifierToken.js',
  'syntax/Keywords.js',
  'syntax/LineNumberTable.js',
  'syntax/SourceFile.js',
  'syntax/Scanner.js',
  'syntax/PredefinedName.js',
  'syntax/trees/ParseTree.js',
  'syntax/trees/NullTree.js',
  'syntax/trees/ParseTrees.js',
  'util/ErrorReporter.js',
  'util/MutedErrorReporter.js',
  'util/TestErrorReporter.js',
  'codegeneration/ParseTreeFactory.js',
  'syntax/Parser.js',
  'syntax/ParseTreeVisitor.js',
  'util/StringBuilder.js',
  'semantics/VariableBinder.js',
  'semantics/symbols/SymbolType.js',
  'semantics/symbols/Symbol.js',
  'semantics/symbols/ModuleSymbol.js',
  'semantics/symbols/ExportSymbol.js',
  'semantics/symbols/Project.js',
  'outputgeneration/ParseTreeWriter.js',
  'outputgeneration/ParseTreeMapWriter.js',
  'outputgeneration/TreeWriter.js',
  'syntax/ParseTreeValidator.js',
  'codegeneration/ParseTreeTransformer.js',
  'codegeneration/FindVisitor.js',
  'codegeneration/FindInFunctionScope.js',
  'codegeneration/ArrowFunctionTransformer.js',
  'codegeneration/PropertyNameShorthandTransformer.js',
  'codegeneration/AlphaRenamer.js',
  'codegeneration/TempVarTransformer.js',
  'codegeneration/DestructuringTransformer.js',
  'codegeneration/DefaultParametersTransformer.js',
  'codegeneration/RestParameterTransformer.js',
  'codegeneration/SpreadTransformer.js',
  'codegeneration/UniqueIdentifierGenerator.js',
  'codegeneration/ForOfTransformer.js',
  'codegeneration/ModuleTransformer.js',
  'codegeneration/OperatorExpander.js',
  'codegeneration/SuperTransformer.js',
  'codegeneration/CascadeExpressionTransformer.js',
  'codegeneration/ClassTransformer.js',
  'codegeneration/BlockBindingTransformer.js',
  'codegeneration/QuasiLiteralTransformer.js',
  'codegeneration/CollectionTransformer.js',
  'codegeneration/IsExpressionTransformer.js',
  'codegeneration/ComprehensionTransformer.js',
  'codegeneration/GeneratorComprehensionTransformer.js',
  'codegeneration/ArrayComprehensionTransformer.js',
  'codegeneration/ObjectLiteralTransformer.js',
  'codegeneration/AtNameMemberTransformer.js',
  'codegeneration/PrivateNameSyntaxTransformer.js',
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
  'syntax/trees/StateMachine.js',
  'codegeneration/generator/BreakContinueTransformer.js',
  'codegeneration/generator/CPSTransformer.js',
  'codegeneration/generator/GeneratorTransformer.js',
  'codegeneration/generator/AsyncTransformer.js',
  'codegeneration/GeneratorTransformPass.js',
  'semantics/FreeVariableChecker.js',
  'codegeneration/ProgramTransformer.js',
  'outputgeneration/ProjectWriter.js',
  'codegeneration/module/ModuleVisitor.js',
  'codegeneration/module/ModuleDefinitionVisitor.js',
  'codegeneration/module/ExportVisitor.js',
  'codegeneration/module/ModuleDeclarationVisitor.js',
  'codegeneration/module/ValidationVisitor.js',
  'codegeneration/module/ModuleRequireVisitor.js',
  'codegeneration/module/ImportStarVisitor.js',
  'semantics/ModuleAnalyzer.js',
  'codegeneration/Compiler.js',
  'runtime/runtime.js',
  'runtime/modules.js'
];


var fs = require('fs');
var path = require('path');

require('../src/traceur-node.js');

var Compiler = traceur.codegeneration.Compiler;
var ErrorReporter = traceur.util.ErrorReporter;
var Program = traceur.syntax.trees.Program;
var Project = traceur.semantics.symbols.Project;
var SourceFile = traceur.syntax.SourceFile
var TreeWriter = traceur.outputgeneration.TreeWriter;

/**
 * Recursively makes all directoires, similar to mkdir -p
 * @param {string} dir
 */
function mkdirRecursive(dir) {
  var parts = path.normalize(dir).split('/');

  dir = '';
  for (var i = 0; i < parts.length; i++) {
    dir += parts[i] + '/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, 0x1FF);
    }
  }
}

traceur.options.reset(true);
traceur.options.arrowFunctions = true;

var srcDir = path.join(path.dirname(process.argv[1]), '..', 'src');

// Accomulate all programElements into this array.
var elements = [];

var reporter = new ErrorReporter();
var project = new Project(srcDir);

var dummyImportScript = 'this.traceurImportScript = function() {};';
project.addFile(new SourceFile('@dummy', dummyImportScript));

// traceur.includes.unshift('traceur.js');

includes.forEach(function(filename) {
  var data = fs.readFileSync(path.join(srcDir, filename), 'utf8');
  if (!data) {
    console.error('Failed to read ' + filename);
    process.exit(1);
  }
  var sourceFile = new SourceFile(filename, data);
  project.addFile(sourceFile);
});

var results = Compiler.compile(reporter, project);
if (reporter.hadError()) {
  console.error('Compilation failed.');
  process.exit(1);
}

results.keys().forEach(function(file) {
  var tree = results.get(file);
  elements.push.apply(elements, tree.programElements);
});

var programTree = new Program(null, elements);
var contents = TreeWriter.write(programTree);
var outputfile = process.argv[2];
mkdirRecursive(path.dirname(outputfile));

fs.writeFileSync(outputfile, contents, 'utf8');

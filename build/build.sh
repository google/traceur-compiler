#!/bin/bash

# Run it through Closure Compiler service.

# No-op the importScript for traceur.js so we don't try to re-import deps.
echo "this.traceurImportScript = function() {};" > tmp.js

cat            ../src/traceur.js\
               ../third_party/source-map/lib/source-map/array-set.js\
               ../third_party/source-map/lib/source-map/base64.js\
               ../third_party/source-map/lib/source-map/base64-vlq.js\
               ../third_party/source-map/lib/source-map/binary-search.js\
               ../third_party/source-map/lib/source-map/util.js\
               ../third_party/source-map/lib/source-map/source-map-generator.js\
               ../third_party/source-map/lib/source-map/source-map-consumer.js\
               ../third_party/source-map/lib/source-map/source-node.js\
               ../src/outputgeneration/SourceMapIntegration.js\
               ../src/options.js\
               ../src/util/util.js\
               ../src/util/ArrayMap.js\
               ../src/util/ObjectMap.js\
               ../src/util/SourceRange.js\
               ../src/util/SourcePosition.js\
               ../src/util/url.js\
               ../src/syntax/TokenType.js\
               ../src/syntax/Token.js\
               ../src/syntax/LiteralToken.js\
               ../src/syntax/IdentifierToken.js\
               ../src/syntax/Keywords.js\
               ../src/syntax/LineNumberTable.js\
               ../src/syntax/SourceFile.js\
               ../src/syntax/Scanner.js\
               ../src/syntax/PredefinedName.js\
               ../src/syntax/trees/ParseTree.js\
               ../src/syntax/trees/NullTree.js\
               ../src/syntax/trees/ParseTrees.js\
               ../src/util/ErrorReporter.js\
               ../src/util/MutedErrorReporter.js\
               ../src/util/TestErrorReporter.js\
               ../src/codegeneration/ParseTreeFactory.js\
               ../src/syntax/Parser.js\
               ../src/syntax/ParseTreeVisitor.js\
               ../src/util/StringBuilder.js\
               ../src/semantics/VariableBinder.js\
               ../src/semantics/symbols/SymbolType.js\
               ../src/semantics/symbols/Symbol.js\
               ../src/semantics/symbols/ModuleSymbol.js\
               ../src/semantics/symbols/ExportSymbol.js\
               ../src/semantics/symbols/Project.js\
               ../src/outputgeneration/ParseTreeWriter.js\
               ../src/outputgeneration/ParseTreeMapWriter.js\
               ../src/outputgeneration/TreeWriter.js\
               ../src/syntax/ParseTreeValidator.js\
               ../src/codegeneration/ParseTreeTransformer.js\
               ../src/codegeneration/FindInFunctionScope.js\
               ../src/codegeneration/ArrowFunctionTransformer.js\
               ../src/codegeneration/PropertyMethodAssignmentTransformer.js\
               ../src/codegeneration/PropertyNameShorthandTransformer.js\
               ../src/codegeneration/AlphaRenamer.js\
               ../src/codegeneration/TempVarTransformer.js\
               ../src/codegeneration/DestructuringTransformer.js\
               ../src/codegeneration/DefaultParametersTransformer.js\
               ../src/codegeneration/RestParameterTransformer.js\
               ../src/codegeneration/SpreadTransformer.js\
               ../src/codegeneration/UniqueIdentifierGenerator.js\
               ../src/codegeneration/ForOfTransformer.js\
               ../src/codegeneration/ModuleTransformer.js\
               ../src/codegeneration/OperatorExpander.js\
               ../src/codegeneration/SuperTransformer.js\
               ../src/codegeneration/CascadeExpressionTransformer.js\
               ../src/codegeneration/ClassTransformer.js\
               ../src/codegeneration/BlockBindingTransformer.js\
               ../src/codegeneration/QuasiLiteralTransformer.js\
               ../src/codegeneration/CollectionTransformer.js\
               ../src/codegeneration/IsExpressionTransformer.js\
               ../src/codegeneration/ComprehensionTransformer.js\
               ../src/codegeneration/GeneratorComprehensionTransformer.js\
               ../src/codegeneration/ArrayComprehensionTransformer.js\
               ../src/codegeneration/generator/ForInTransformPass.js\
               ../src/codegeneration/generator/State.js\
               ../src/codegeneration/generator/FallThroughState.js\
               ../src/codegeneration/generator/TryState.js\
               ../src/codegeneration/generator/BreakState.js\
               ../src/codegeneration/generator/CatchState.js\
               ../src/codegeneration/generator/ConditionalState.js\
               ../src/codegeneration/generator/ContinueState.js\
               ../src/codegeneration/generator/EndState.js\
               ../src/codegeneration/generator/FinallyFallThroughState.js\
               ../src/codegeneration/generator/FinallyState.js\
               ../src/codegeneration/generator/SwitchState.js\
               ../src/codegeneration/generator/YieldState.js\
               ../src/codegeneration/generator/StateAllocator.js\
               ../src/syntax/trees/StateMachine.js\
               ../src/codegeneration/generator/BreakContinueTransformer.js\
               ../src/codegeneration/generator/CPSTransformer.js\
               ../src/codegeneration/generator/GeneratorTransformer.js\
               ../src/codegeneration/generator/AsyncTransformer.js\
               ../src/codegeneration/GeneratorTransformPass.js\
               ../src/semantics/FreeVariableChecker.js\
               ../src/codegeneration/ProgramTransformer.js\
               ../src/outputgeneration/ProjectWriter.js\
               ../src/codegeneration/module/ModuleVisitor.js\
               ../src/codegeneration/module/ModuleDefinitionVisitor.js\
               ../src/codegeneration/module/ExportVisitor.js\
               ../src/codegeneration/module/ModuleDeclarationVisitor.js\
               ../src/codegeneration/module/ValidationVisitor.js\
               ../src/codegeneration/module/ModuleRequireVisitor.js\
               ../src/codegeneration/module/ImportStarVisitor.js\
               ../src/semantics/ModuleAnalyzer.js\
               ../src/codegeneration/Compiler.js\
               ../src/runtime/runtime.js\
               ../src/runtime/modules.js >> tmp.js

python post.py tmp.js > ../bin/traceur.js
rm tmp.js

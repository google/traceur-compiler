// Copyright 2011 Google Inc.
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

traceur.define('codegeneration', function() {
  'use strict';

  var TokenType = traceur.syntax.TokenType;
  var PredefinedName = traceur.syntax.PredefinedName;
  var ProgramTree = traceur.syntax.trees.ProgramTree;

  var EXPORT_DECLARATION = traceur.syntax.trees.ParseTreeType.EXPORT_DECLARATION;
  var IMPORT_DECLARATION = traceur.syntax.trees.ParseTreeType.IMPORT_DECLARATION;
  var MODULE_DEFINITION = traceur.syntax.trees.ParseTreeType.MODULE_DEFINITION;

  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;

  var createArgumentList = traceur.codegeneration.ParseTreeFactory.createArgumentList;
  var createBlock = traceur.codegeneration.ParseTreeFactory.createBlock;
  var createCallCall = traceur.codegeneration.ParseTreeFactory.createCallCall;
  var createCallExpression = traceur.codegeneration.ParseTreeFactory.createCallExpression;
  var createEmptyParameterList = traceur.codegeneration.ParseTreeFactory.createEmptyParameterList;
  var createFunctionExpression = traceur.codegeneration.ParseTreeFactory.createFunctionExpression;
  var createGetAccessor = traceur.codegeneration.ParseTreeFactory.createGetAccessor;
  var createIdentifierExpression = traceur.codegeneration.ParseTreeFactory.createIdentifierExpression;
  var createMemberExpression = traceur.codegeneration.ParseTreeFactory.createMemberExpression;
  var createNullLiteral = traceur.codegeneration.ParseTreeFactory.createNullLiteral;
  var createObjectFreeze = traceur.codegeneration.ParseTreeFactory.createObjectFreeze;
  var createObjectLiteralExpression = traceur.codegeneration.ParseTreeFactory.createObjectLiteralExpression;
  var createReturnStatement = traceur.codegeneration.ParseTreeFactory.createReturnStatement;
  var createParameterList = traceur.codegeneration.ParseTreeFactory.createParameterList;
  var createParenExpression = traceur.codegeneration.ParseTreeFactory.createParenExpression;
  var createPropertyNameAssignment = traceur.codegeneration.ParseTreeFactory.createPropertyNameAssignment;
  var createScopedExpression = traceur.codegeneration.ParseTreeFactory.createScopedExpression;
  var createStringLiteral = traceur.codegeneration.ParseTreeFactory.createStringLiteral;
  var createThisExpression = traceur.codegeneration.ParseTreeFactory.createThisExpression;
  var createTrueLiteral = traceur.codegeneration.ParseTreeFactory.createTrueLiteral;
  var createVariableStatement = traceur.codegeneration.ParseTreeFactory.createVariableStatement;

  // Object.defineProperty(this, 'NAME', {
  //   get: function() { return NAME; },
  //   enumerable: true
  // });
  function createGetterExport(name) {
    // function() { return NAME; }
    var fun = createFunctionExpression(
        createEmptyParameterList(),
        createBlock(
            createReturnStatement(
                createIdentifierExpression(name))));
    // { get: ... }
    var objectLiteral = createObjectLiteralExpression(
      createPropertyNameAssignment(PredefinedName.GET, fun),
      createPropertyNameAssignment(PredefinedName.ENUMERABLE,
                                   createTrueLiteral()));

    return createCallExpression(
      createMemberExpression(PredefinedName.OBJECT,
                             PredefinedName.DEFINE_PROPERTY),
      createArgumentList(
          createThisExpression(),
          createStringLiteral(name),
          objectLiteral));
  }

  /**
   * @constructor
   * @extends {ParseTreeTransformer}
   */
  function ModuleTransformer() {
    ParseTreeTransformer.call(this);
  }

  ModuleTransformer.prototype = {
    __proto__: ParseTreeTransformer.prototype
  };

  /**
   * @param {Project} project
   * @param {ProgramTree} tree
   * @return {ProgramTree}
   */
  ModuleTransformer.transform = function(project, tree) {
    var module = project.getRootModule();
    var elements = tree.sourceElements.map(function(element) {
      switch (element.type) {
        case MODULE_DEFINITION:
          return transformModule(module, element.asModuleDefinition());
        default:
          return element;
      }
    });
    return new ProgramTree(tree.location, elements);
  };

  /**
   * @param {ModuleSymbol} parent
   * @param {ModuleDefinitionTree} tree
   * @return {ParseTree}
   */
  function transformModule(parent, tree) {
    var module = parent.getModule(tree.name.value);

    var statements = [];

    // use strict
    statements.push(createStringLiteral('use strict'));

    // Add exports
    module.getExports().forEach(function(exp) {
      // Object.defineProperty(this, 'export_name', ...)
      statements.push(createGetterExport(exp.name));
    });

    // Object.freeze(this)
    statements.push(createObjectFreeze(createThisExpression()));

    // Add original body statements
    tree.elements.forEach(function(element) {
      switch (element.type) {
        case MODULE_DEFINITION:
          statements.push(transformModule(module,
                                          element.asModuleDefinition()));
          break;
        case EXPORT_DECLARATION:
          var declaration = element.asExportDeclaration().declaration;
          if (declaration.type == MODULE_DEFINITION) {
            declaration = transformModule(module,
                                          declaration.asModuleDefinition());
          }
          statements.push(declaration);
          break;
        case IMPORT_DECLARATION:
          throw new Error('Not implemented');
          break;
        default:
          // class, trait, statement, function declaration
          statements.push(element);
      }
    });

    // return this
    statements.push(createReturnStatement(createThisExpression()));

    // Object.create(null)
    var thisObject = createCallExpression(
      createMemberExpression(PredefinedName.OBJECT,
                             PredefinedName.CREATE),
      createArgumentList(createNullLiteral()));

    // const M = (function() { statements }).call(thisObject);
    // TODO(arv): const is not allowed in ES5 strict
    return createVariableStatement(TokenType.VAR, module.name,
        createCallCall(
            createParenExpression(
                createFunctionExpression(createEmptyParameterList(),
                                         createBlock(statements))),
            thisObject));
  }

  ModuleTransformer.prototype = {
    __proto__: ParseTreeTransformer.prototype
  };

  return {
    ModuleTransformer: ModuleTransformer
  };
});

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

  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var PredefinedName = traceur.syntax.PredefinedName;
  var Program = traceur.syntax.trees.Program;
  var TokenType = traceur.syntax.TokenType;

  var CLASS_DECLARATION = traceur.syntax.trees.ParseTreeType.CLASS_DECLARATION;
  var EXPORT_DECLARATION = traceur.syntax.trees.ParseTreeType.EXPORT_DECLARATION;
  var EXPORT_PATH_LIST = traceur.syntax.trees.ParseTreeType.EXPORT_PATH_LIST;
  var EXPORT_PATH_SPECIFIER = traceur.syntax.trees.ParseTreeType.EXPORT_PATH_SPECIFIER;
  var EXPORT_SPECIFIER = traceur.syntax.trees.ParseTreeType.EXPORT_SPECIFIER;
  var FUNCTION_DECLARATION = traceur.syntax.trees.ParseTreeType.FUNCTION_DECLARATION;
  var IDENTIFIER_EXPRESSION = traceur.syntax.trees.ParseTreeType.IDENTIFIER_EXPRESSION;
  var IMPORT_DECLARATION = traceur.syntax.trees.ParseTreeType.IMPORT_DECLARATION;
  var MODULE_DECLARATION = traceur.syntax.trees.ParseTreeType.MODULE_DECLARATION;
  var MODULE_DEFINITION = traceur.syntax.trees.ParseTreeType.MODULE_DEFINITION;
  var MODULE_REQUIRE = traceur.syntax.trees.ParseTreeType.MODULE_REQUIRE;
  var QUALIFIED_REFERENCE = traceur.syntax.trees.ParseTreeType.QUALIFIED_REFERENCE;
  var TRAIT_DECLARATION = traceur.syntax.trees.ParseTreeType.TRAIT_DECLARATION;
  var VARIABLE_STATEMENT = traceur.syntax.trees.ParseTreeType.VARIABLE_STATEMENT;

  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;

  var LiteralExpression = traceur.syntax.trees.LiteralExpression;

  var createArgumentList = traceur.codegeneration.ParseTreeFactory.createArgumentList;
  var createBlock = traceur.codegeneration.ParseTreeFactory.createBlock;
  var createCallCall = traceur.codegeneration.ParseTreeFactory.createCallCall;
  var createCallExpression = traceur.codegeneration.ParseTreeFactory.createCallExpression;
  var createEmptyParameterList = traceur.codegeneration.ParseTreeFactory.createEmptyParameterList;
  var createExpressionStatement = traceur.codegeneration.ParseTreeFactory.createExpressionStatement;
  var createFunctionExpression = traceur.codegeneration.ParseTreeFactory.createFunctionExpression;
  var createGetAccessor = traceur.codegeneration.ParseTreeFactory.createGetAccessor;
  var createIdentifierExpression = traceur.codegeneration.ParseTreeFactory.createIdentifierExpression;
  var createMemberExpression = traceur.codegeneration.ParseTreeFactory.createMemberExpression;
  var createNullLiteral = traceur.codegeneration.ParseTreeFactory.createNullLiteral;
  var createObjectFreeze = traceur.codegeneration.ParseTreeFactory.createObjectFreeze;
  var createObjectLiteralExpression = traceur.codegeneration.ParseTreeFactory.createObjectLiteralExpression;
  var createParameterList = traceur.codegeneration.ParseTreeFactory.createParameterList;
  var createParenExpression = traceur.codegeneration.ParseTreeFactory.createParenExpression;
  var createProgram = traceur.codegeneration.ParseTreeFactory.createProgram;
  var createPropertyNameAssignment = traceur.codegeneration.ParseTreeFactory.createPropertyNameAssignment;
  var createReturnStatement = traceur.codegeneration.ParseTreeFactory.createReturnStatement;
  var createScopedExpression = traceur.codegeneration.ParseTreeFactory.createScopedExpression;
  var createStringLiteral = traceur.codegeneration.ParseTreeFactory.createStringLiteral;
  var createThisExpression = traceur.codegeneration.ParseTreeFactory.createThisExpression;
  var createTrueLiteral = traceur.codegeneration.ParseTreeFactory.createTrueLiteral;
  var createUseStrictDirective = traceur.codegeneration.ParseTreeFactory.createUseStrictDirective;
  var createVariableDeclaration = traceur.codegeneration.ParseTreeFactory.createVariableDeclaration;
  var createVariableDeclarationList = traceur.codegeneration.ParseTreeFactory.createVariableDeclarationList;
  var createVariableStatement = traceur.codegeneration.ParseTreeFactory.createVariableStatement;

  /**
   * This creates the code that defines the getter for an export.
   * @param {ExportSymbol} symbol
   * @return {ParseTree}
   */
  function getGetterExport(symbol) {
    // Object.defineProperty(this, 'NAME', {
    //   get: function() { return <returnExpression>; },
    //   enumerable: true
    // });
    var name = symbol.name;
    var tree = symbol.tree;
    var returnExpression;
    switch (tree.type) {
      case EXPORT_SPECIFIER:
        returnExpression = transformQualifiedReferenceParts(symbol.relatedTree,
            tree.rhs || tree.lhs);
        break;
      case EXPORT_PATH_SPECIFIER:
        returnExpression = new ModuleTransformer().transformAny(tree.specifier);
        break;
      case IDENTIFIER_EXPRESSION:
        if (!symbol.relatedTree)
          returnExpression = tree;
        else
          returnExpression = transformQualifiedReferenceParts(symbol.relatedTree,
              tree.identifierToken);
        break;
      case QUALIFIED_REFERENCE:
        returnExpression = new ModuleTransformer().transformAny(tree);
        break;
      default:
        returnExpression = createIdentifierExpression(name);
        break;
    }

    // function() { return <returnExpression>; }
    var fun = createFunctionExpression(
        createEmptyParameterList(),
        createBlock(
            createReturnStatement(returnExpression)));
    // { get: ... }
    var objectLiteral = createObjectLiteralExpression(
        createPropertyNameAssignment(PredefinedName.GET, fun),
        createPropertyNameAssignment(PredefinedName.ENUMERABLE,
        createTrueLiteral()));

    return createExpressionStatement(
        createCallExpression(
            createMemberExpression(PredefinedName.OBJECT,
                PredefinedName.DEFINE_PROPERTY),
            createArgumentList(
                createThisExpression(),
                createStringLiteral(name),
                objectLiteral)));
  }

  /**
   * Transforms a module expression and an identifier. This is used to create
   * a member expression for something like a.b.c.{d, e, f}.
   * @param {ParseTree} moduleExpression
   * @param {IdentifierToken} identifierToken
   * @return {ParseTree}
   */
  function transformQualifiedReferenceParts(moduleExpression, identifierToken) {
    var operand = new ModuleTransformer().transformAny(moduleExpression);
    return createMemberExpression(operand, identifierToken);
  }

  /**
   * @constructor
   * @extends {ParseTreeTransformer}
   */
  function ModuleTransformer() {
    ParseTreeTransformer.call(this);
  }

  ModuleTransformer.prototype = traceur.createObject(
      ParseTreeTransformer.prototype, {

    /**
     * @param {ModuleExpression} tree
     * @return {ParseTree}
     */
    transformModuleExpression: function(tree) {
      var reference = tree.reference;
      if (reference.type == MODULE_REQUIRE) {
        // traceur.runtime.getModuleInstanceByUrl(url)
        return createCallExpression(
            createMemberExpression(
                PredefinedName.TRACEUR,
                PredefinedName.RUNTIME,
                PredefinedName.GET_MODULE_INSTANCE_BY_URL),
            createArgumentList(
                new LiteralExpression(null, reference.url)));
      }

      if (tree.identifiers.length == 0)
        return reference;

      return createMemberExpression(reference, tree.identifiers);
    },

    /**
     * @param {ModuleSpecifier} tree
     * @return {VariableDeclaration}
     */
    transformModuleSpecifier: function(tree) {
      var expression = this.transformAny(tree.expression);
      return createVariableDeclaration(tree.identifier, expression);
    },

    /**
     * @param {QualifiedReference} tree
     * @return {ParseTree}
     */
    transformQualifiedReference: function(tree) {
      return transformQualifiedReferenceParts(tree.moduleExpression,
          tree.identifier);
    }
  });

  /**
   * @param {Project} project
   * @param {Program} tree
   * @return {Program}
   */
  ModuleTransformer.transform = function(project, tree) {
    var module = project.getRootModule();
    var elements = tree.programElements.map(function(element) {
      switch (element.type) {
        case MODULE_DEFINITION:
          return transformDefinition(module, element);
        case MODULE_DECLARATION:
          return transformDeclaration(module, element);
        default:
          return element;
      }
    });
    return new Program(tree.location, elements);
  };

  /**
   * @param {Module} module
   * @param {Program} tree
   * @return {Program}
   */
  ModuleTransformer.transformAsModule = function(module, tree) {
    var callExpression = transformModuleElements(module, tree.programElements);
    return createProgram([createExpressionStatement(callExpression)]);
  };

  /**
   * Transforms a module into a call expression.
   * @param {ModuleSymbol} module
   * @param {Array.<ParseTree>} elements
   * @return {CallExpression}
   */
  function transformModuleElements(module, elements) {
    var statements = [];

    // use strict
    statements.push(createUseStrictDirective());

    // Add exports
    module.getExports().forEach(function(exp) {
      // Object.defineProperty(this, 'export_name', ...)
      statements.push(getGetterExport(exp));
    });

    // Object.freeze(this)
    statements.push(
        createExpressionStatement(createObjectFreeze(createThisExpression())));

    // Add original body statements
    elements.forEach(function(element) {
      switch (element.type) {
        case MODULE_DECLARATION:
          statements.push(transformDeclaration(module, element));
          break;
        case MODULE_DEFINITION:
          statements.push(transformDefinition(module, element));
          break;
        case EXPORT_DECLARATION:
          var declaration = element.declaration;
          switch (declaration.type) {
            case MODULE_DEFINITION:
              statements.push(transformDefinition(module, declaration));
              break;
            case MODULE_DECLARATION:
              statements.push(transformDeclaration(module, declaration));
              break;
            case EXPORT_PATH_LIST:
              // These do not generate any statement here. It is all taken
              // care of in the export getter.
              break;
            case CLASS_DECLARATION:
            case FUNCTION_DECLARATION:
            case TRAIT_DECLARATION:
            case VARIABLE_STATEMENT:
              statements.push(declaration);
              break;
            default:
              throw new Error('unreachable');
          }
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
    return createCallCall(
        createParenExpression(
            createFunctionExpression(createEmptyParameterList(),
                                     createBlock(statements))),
        thisObject);
  }

  /**
   * Transforms a module definition into a variable statement.
   *
   *   module m { ... }
   *
   * becomes
   *
   *   var m = (function() { ... })(...);
   *
   * @param {ModuleSymbol} parent
   * @param {ModuleDefinition} tree
   * @return {ParseTree}
   */
  function transformDefinition(parent, tree) {
    var module = parent.getModule(tree.name.value);

    var callExpression = transformModuleElements(module, tree.elements);

    // const M = (function() { statements }).call(thisObject);
    // TODO(arv): const is not allowed in ES5 strict
    return createVariableStatement(TokenType.VAR, module.name, callExpression);
  }

  /**
   * @param {ModuleSymbol} parent
   * @param {ModuleDeclaration} tree
   * @return {ParseTree}
   */
  function transformDeclaration(parent, tree) {
    // module m = n, o = p.q, ...;
    // module m = require('url').n.o.p;

    var transformer = new ModuleTransformer();
    var list = tree.specifiers.map(transformer.transformAny, transformer);

    // const a = b.c, d = e.f;
    // TODO(arv): const is not allowed in ES5 strict
    var variableDeclarationList = createVariableDeclarationList(TokenType.VAR,
                                                                list);

    return createVariableStatement(variableDeclarationList);
  }

  return {
    ModuleTransformer: ModuleTransformer
  };
});

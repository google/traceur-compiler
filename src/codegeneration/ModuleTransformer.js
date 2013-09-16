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

import {
  BindingElement,
  BindingIdentifier,
  IdentifierExpression,
  LiteralExpression,
  LiteralPropertyName,
  ObjectPattern,
  ObjectPatternField,
  Program
} from '../syntax/trees/ParseTrees.js';
import {ParseTreeTransformer} from './ParseTreeTransformer.js';
import {
  GET_MODULE_INSTANCE_BY_URL,
  TRACEUR_MODULES
} from '../syntax/PredefinedName.js';
import {
  CLASS_DECLARATION,
  EXPORT_DECLARATION,
  EXPORT_SPECIFIER,
  EXPORT_STAR,
  FUNCTION_DECLARATION,
  IDENTIFIER_EXPRESSION,
  IMPORT_DECLARATION,
  MODULE_DECLARATION,
  MODULE_DEFINITION,
  MODULE_SPECIFIER,
  NAMED_EXPORT,
  VARIABLE_STATEMENT
} from '../syntax/trees/ParseTreeType.js';
import {
  STAR,
  STRING,
  VAR
} from '../syntax/TokenType.js';
import {assert} from '../util/assert.js';
import {
  createArgumentList,
  createBindingIdentifier,
  createCallExpression,
  createEmptyParameterList,
  createExpressionStatement,
  createFunctionBody,
  createFunctionExpression,
  createIdentifierExpression,
  createIdentifierToken,
  createMemberExpression,
  createNullLiteral,
  createObjectCreate,
  createObjectLiteralExpression,
  createObjectPreventExtensions,
  createProgram,
  createPropertyDescriptor,
  createPropertyNameAssignment,
  createReturnStatement,
  createScopedExpression,
  createUseStrictDirective,
  createVariableDeclaration,
  createVariableDeclarationList,
  createVariableStatement
} from './ParseTreeFactory.js';
import {hasUseStrict} from '../semantics/util.js';

function toBindingIdentifier(tree) {
  return new BindingIdentifier(tree.location, tree.identifierToken);
}

/**
 * This creates the code that defines the getter for an export.
 * @param {Project} project
 * @param {ExportSymbol} symbol
 * @return {ParseTree}
 */
function getGetterExport(project, symbol) {
  // NAME: {get: function() { return <returnExpression> },
  var name = symbol.name;
  var tree = symbol.tree;
  var returnExpression;
  switch (tree.type) {
    case EXPORT_SPECIFIER:
      returnExpression = transformSpecifier(project, tree.lhs,
                                            symbol.relatedTree);
      break;

    case EXPORT_STAR:
      assert(symbol.relatedTree);
      returnExpression = transformSpecifier(project,
          createIdentifierToken(symbol.name), symbol.relatedTree);
      break;

    default:
      returnExpression = createIdentifierExpression(name);
      break;
  }

  // function() { return <returnExpression>; }
  var fun = createFunctionExpression(
      createEmptyParameterList(),
      createFunctionBody([createReturnStatement(returnExpression)]));

  // NAME: { get: ... }
  var descriptor = createPropertyDescriptor({
    get: fun,
    enumerable: true
  });
  return createPropertyNameAssignment(name, descriptor);
}

/**
 * Transforms a module expression and an identifier. This is used to create
 * a member expression for something like a.b.c.{d, e, f}.
 * @param {Project} project
 * @param {IdentifierToken} identifierToken
 * @param {ParseTree=} moduleSpecifier
 * @return {ParseTree}
 */
function transformSpecifier(project, identifierToken, moduleSpecifier) {
  if (moduleSpecifier) {
    var operand = new ModuleTransformer(project).transformAny(moduleSpecifier);
    return createMemberExpression(operand, identifierToken);
  }

  return createIdentifierExpression(identifierToken);
}

export class ModuleTransformer extends ParseTreeTransformer {
  /**
   * @param {Project} project
   */
  constructor(project) {
    super();
    this.project_ = project;
  }

  /**
   * @param {ModuleSpecifier} tree
   * @return {ParseTree}
   */
  transformModuleSpecifier(tree) {
    var token = tree.token;
    if (token.type === STRING) {
      // traceur.modules.getModuleInstanceByUrl(url)
      return createCallExpression(
          createMemberExpression(TRACEUR_MODULES, GET_MODULE_INSTANCE_BY_URL),
          createArgumentList(
              new LiteralExpression(null, token)));
    }

    return new IdentifierExpression(token.location, token);
  }

  /**
   * @param {ModuleDeclaration} tree
   * @return {VariableDeclaration}
   */
  transformModuleDeclaration(tree) {
    var initializer = this.transformAny(tree.expression);
    // const a = b.c, d = e.f;
    // TODO(arv): const is not allowed in ES5 strict
    return createVariableStatement(VAR, tree.identifier, initializer);
  }

  transformImportDeclaration(tree) {
    // import {id} from module;
    //  =>
    // var {id} = moduleInstance
    var binding = this.transformAny(tree.importSpecifierSet);
    var initializer = this.transformAny(tree.moduleSpecifier);

    return createVariableStatement(VAR, binding, initializer);
  }

  transformImportSpecifierSet(tree) {
    var fields;
    if (tree.specifiers.type === STAR) {
      var module = this.project_.getModuleForStarTree(tree);
      var fields = module.getExports().map((exportSymbol) => {
        return new BindingElement(tree.location,
            createBindingIdentifier(exportSymbol.name), null);
      });
    } else {
      fields = this.transformList(tree.specifiers);
    }
    return new ObjectPattern(null, fields);
  }

  transformImportSpecifier(tree) {
    if (tree.rhs) {
      var binding = new BindingIdentifier(tree.location, tree.rhs);
      var bindingElement = new BindingElement(tree.location, binding, null);
      var name = new LiteralPropertyName(tree.lhs.location, tree.lhs);
      return new ObjectPatternField(tree.location, name, bindingElement);
    }
    return new BindingElement(tree.location,
        createBindingIdentifier(tree.lhs), null);
  }
}

/**
 * @param {Project} project
 * @param {Program} tree
 * @return {Program}
 */
ModuleTransformer.transform = function(project, tree) {
  var module = project.getRootModule();
  var useStrictCount = hasUseStrict(tree.programElements) ? 1 : 0;
  var transformer = new ModuleTransformer(project);
  var elements = tree.programElements.map((element) => {
    switch (element.type) {
      case MODULE_DEFINITION:
        return transformDefinition(project, module, element, useStrictCount);
      case MODULE_DECLARATION:
      case IMPORT_DECLARATION:
        return transformer.transformAny(element);
      default:
        return element;
    }
  });
  return new Program(tree.location, elements);
};

/**
 * @param {Project} project
 * @param {Module} module
 * @param {Program} tree
 * @return {Program}
 */
ModuleTransformer.transformAsModule = function(project, module, tree) {
  var callExpression = transformModuleElements(project, module,
                                               tree.programElements);
  return createProgram([createExpressionStatement(callExpression)]);
};

/**
 * Transforms a module into a call expression.
 * @param {Project} project
 * @param {ModuleSymbol} module
 * @param {Array.<ParseTree>} elements
 * @return {CallExpression}
 */
function transformModuleElements(project, module, elements, useStrictCount) {
  var statements = [];

  useStrictCount = useStrictCount || 0;
  // use strict
  if (!useStrictCount)
    statements.push(createUseStrictDirective());

  var transformer = new ModuleTransformer(project);

  // Add original body statements
  elements.forEach((element) => {
    switch (element.type) {
      case MODULE_DECLARATION:
      case IMPORT_DECLARATION:
        statements.push(transformer.transformAny(element));
        break;
      case MODULE_DEFINITION:
        statements.push(transformDefinition(project, module, element,
                                            useStrictCount + 1));
        break;
      case EXPORT_DECLARATION:
        var declaration = element.declaration;
        switch (declaration.type) {
          case MODULE_DEFINITION:
            statements.push(transformDefinition(project, module, declaration,
                                                useStrictCount + 1));
            break;
          case MODULE_DECLARATION:
            statements.push(transformer.transformAny(declaration));
            break;
          case NAMED_EXPORT:
            // These do not generate any statement here. It is all taken
            // care of in the export getter.
            break;
          case CLASS_DECLARATION:
          case FUNCTION_DECLARATION:
          case VARIABLE_STATEMENT:
            statements.push(declaration);
            break;
          default:
            throw new Error('unreachable');
        }
        break;

      default:
        // class, statement, function declaration
        statements.push(element);
    }
  });

  // Add exports
  var properties = module.getExports().map((exp) => {
    // export_name: {get: function() { return export_name },
    return getGetterExport(project, exp);
  });
  var descriptors = createObjectLiteralExpression(properties);

  // return Object.preventExtensions(Object.create(null, descriptors))
  statements.push(
      createReturnStatement(
          createObjectPreventExtensions(
              createObjectCreate(createNullLiteral(), descriptors))));

  // const M = (function() { statements }).call(this);
  // TODO(arv): const is not allowed in ES5 strict
  return createScopedExpression(createFunctionBody(statements));
}

/**
 * Transforms a module definition into a variable statement.
 *
 *   module m {
 *     ...
 *     export x ...
 *   }
 *
 * becomes
 *
 *   var m = (function() {
 *      ...
 *      return Object.freeze({
 *        get x() { return x }
 *      };
 *   }).call(this);
 *
 * @param {Project} project
 * @param {ModuleSymbol} parent
 * @param {ModuleDefinition} tree
 * @param {number} useStrictCount
 * @return {ParseTree}
 */
function transformDefinition(project, parent, tree, useStrictCount) {
  var module = parent.getModule(tree.name.value);

  var callExpression = transformModuleElements(project, module,
                                               tree.elements, useStrictCount);

  // const M = (function() { statements }).call(thisObject);
  // TODO(arv): const is not allowed in ES5 strict
  return createVariableStatement(VAR, module.name, callExpression);
}

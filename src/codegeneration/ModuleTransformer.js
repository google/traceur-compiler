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
  Script
} from '../syntax/trees/ParseTrees.js';
import {TempVarTransformer} from './TempVarTransformer.js';
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
  IDENTIFIER,
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
  createScript,
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
import {options} from '../options.js';
import {
  parseExpression,
  parseStatement
} from './PlaceholderParser.js';
import {resolveUrl} from '../util/url.js';

function toBindingIdentifier(tree) {
  return new BindingIdentifier(tree.location, tree.identifierToken);
}

/**
 * This creates the code that defines the getter for an export.
 * @param {ModuleTransformer} transformer
 * @param {Project} project
 * @param {ExportSymbol} symbol
 * @return {ParseTree}
 */
function getGetterExport(transformer, project, symbol) {
  // NAME: {get: function() { return <returnExpression> },
  var name = symbol.name;
  var tree = symbol.tree;
  var returnExpression;
  switch (tree.type) {
    case EXPORT_SPECIFIER:
      var moduleSpecifier = symbol.relatedTree;
      if (moduleSpecifier) {
        var idName =
            transformer.getTempVarNameForModuleSpecifier(moduleSpecifier);
        returnExpression = createMemberExpression(idName, tree.lhs);
      } else {
        returnExpression = transformSpecifier(transformer, project, tree.lhs);
      }
      break;

    case EXPORT_STAR:
      assert(symbol.relatedTree);
      var moduleSpecifier = symbol.relatedTree;
      var idName =
          transformer.getTempVarNameForModuleSpecifier(moduleSpecifier);
      returnExpression = createMemberExpression(idName, symbol.name);
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
 * a member expression for something like System.get('name').prop
 * @param {ModuleTransformer} transformer
 * @param {Project} project
 * @param {IdentifierToken} identifierToken
 * @param {ParseTree=} moduleSpecifier
 * @return {ParseTree}
 */
function transformSpecifier(transformer, project, identifierToken,
                            moduleSpecifier) {
  if (moduleSpecifier) {
    var operand = transformer.transformAny(moduleSpecifier);
    return createMemberExpression(operand, identifierToken);
  }

  return createIdentifierExpression(identifierToken);
}

export class ModuleTransformer extends TempVarTransformer {
  /**
   * @param {Project} project
   */
  constructor(project) {
    super(project.identifierGenerator);
    this.project_ = project;
    this.idMappingStack_ = [Object.create(null)];
  }

  getTempVarNameForModuleSpecifier(moduleSpecifier) {
    var moduleName = moduleSpecifier.token.processedValue;
    var idMapping = this.idMappingStack_[this.idMappingStack_.length - 1]
    var id = idMapping[moduleName];
    return id || (idMapping[moduleName] = this.getTempIdentifier());
  }

  pushTempVarState() {
    super.pushTempVarState();
    this.idMappingStack_.push(Object.create(null));
  }

  popTempVarState() {
    super.popTempVarState();
    this.idMappingStack_.pop();
  }

  /**
   * @param {ModuleSpecifier} tree
   * @return {ParseTree}
   */
  transformModuleSpecifier(tree) {
    var token = tree.token;
    if (token.type === STRING)
      return parseExpression `System.get(${token})`;

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
    // import {id} from 'module';
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
 * @param {Script} tree
 * @return {Script}
 */
ModuleTransformer.transform = function(project, tree) {
  var module = project.getRootModule();
  var useStrictCount = hasUseStrict(tree.scriptItemList) ? 1 : 0;
  var transformer = new ModuleTransformer(project);
  var elements = tree.scriptItemList.map((element) => {
    switch (element.type) {
      case MODULE_DEFINITION:
        return transformDefinition(transformer, project, module, element, useStrictCount);
      case MODULE_DECLARATION:
      case IMPORT_DECLARATION:
        return transformer.transformAny(element);
      default:
        return element;
    }
  });
  return new Script(tree.location, elements);
};

/**
 * @param {Project} project
 * @param {Module} module
 * @param {Script} tree
 * @return {Script}
 */
ModuleTransformer.transformAsModule = function(project, module, tree) {
  var transformer = new ModuleTransformer(project);
  var callExpression = transformModuleElements(transformer, project, module,
                                               tree.scriptItemList);
  return createScript([createRegister(module.url, callExpression)]);
};

/**
 * Transforms a module into a call expression.
 * @param {ModuleTransformer} transformer
 * @param {Project} project
 * @param {ModuleSymbol} module
 * @param {Array.<ParseTree>} elements
 * @return {CallExpression}
 */
function transformModuleElements(transformer, project, module, elements,
                                 useStrictCount) {
  var statements = [];

  transformer.pushTempVarState();

  useStrictCount = useStrictCount || 0;
  // use strict
  if (!useStrictCount)
    statements.push(createUseStrictDirective());

  // Add original body statements
  elements.forEach((element) => {
    var statement;
    switch (element.type) {
      case MODULE_DECLARATION:
      case IMPORT_DECLARATION:
        statements.push(transformer.transformAny(element));
        break;
      case MODULE_DEFINITION:
        statements.push(transformDefinition(transformer, project, module,
            element, useStrictCount + 1));
        break;
      case EXPORT_DECLARATION:
        var declaration = element.declaration;
        switch (declaration.type) {
          case MODULE_DEFINITION:
            statements.push(transformDefinition(transformer, project, module,
                declaration, useStrictCount + 1));
            break;
          case MODULE_DECLARATION:
            statements.push(transformer.transformAny(declaration));
            break;
          case NAMED_EXPORT:
            var moduleSpecifier = declaration.moduleSpecifier;
            if (moduleSpecifier) {
              var expression = transformer.transformAny(moduleSpecifier);
              var idName =
                  transformer.getTempVarNameForModuleSpecifier(moduleSpecifier);
              statements.push(createVariableStatement(VAR, idName, expression));
            }
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
    return getGetterExport(transformer, project, exp);
  });
  var descriptors = createObjectLiteralExpression(properties);

  // return Object.preventExtensions(Object.create(null, descriptors))
  statements.push(
      createReturnStatement(
          createObjectPreventExtensions(
              createObjectCreate(createNullLiteral(), descriptors))));

  transformer.popTempVarState();

  // const M = (function() { statements }).call(this);
  // TODO(arv): const is not allowed in ES5 strict
  return createScopedExpression(createFunctionBody(statements));
}

/**
 * Transforms a module definition into a variable statement.
 *
 *   module 'm' {
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
 * @param {ModuleTransformer} transformer
 * @param {Project} project
 * @param {ModuleSymbol} parent
 * @param {ModuleDefinition} tree
 * @param {number} useStrictCount
 * @return {ParseTree}
 */
function transformDefinition(transformer, project, parent, tree,
                             useStrictCount) {
  transformer.pushTempVarState();
  var module;
  if (tree.name.type === IDENTIFIER) {
    module = parent.getModule(tree.name.value);
  } else {
    var baseUrl = parent ? parent.url : project.url;
    var url = resolveUrl(baseUrl, tree.name.processedValue);
    module = project.getModuleForResolvedUrl(url);
  }
  assert(module);

  var callExpression = transformModuleElements(transformer,project, module,
                                               tree.elements, useStrictCount);

  transformer.popTempVarState();

  if (tree.name.type === IDENTIFIER) {
    // const M = (function() { statements }).call(thisObject);
    // TODO(arv): const is not allowed in ES5 strict
    return createVariableStatement(VAR, module.name, callExpression);
  }

  return createRegister(tree.name, callExpression)
}

function createRegister(name, callExpression) {
  // TODO(arv): Refactor transformModuleElements.
  // $traceurModules.registerModule(name, func, this)
  var func = callExpression.operand.operand.expression;
  return parseStatement
      `System.get('@traceur/module').registerModule(${name}, ${func}, this);`;
}

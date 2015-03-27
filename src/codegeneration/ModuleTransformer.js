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
  AnonBlock,
  BindingElement,
  EmptyStatement,
  LiteralPropertyName,
  ObjectPattern,
  ObjectPatternField,
  Script
} from '../syntax/trees/ParseTrees.js';
import {DestructuringTransformer} from './DestructuringTransformer.js';
import {DirectExportVisitor} from './module/DirectExportVisitor.js';
import {TempVarTransformer} from './TempVarTransformer.js';
import {
  CLASS_DECLARATION,
  EXPORT_DEFAULT,
  EXPORT_SPECIFIER,
  FORWARD_DEFAULT_EXPORT,
  FUNCTION_DECLARATION,
  IMPORT_SPECIFIER_SET,
  NAME_SPACE_EXPORT
} from '../syntax/trees/ParseTreeType.js';
import {VAR} from '../syntax/TokenType.js';
import {assert} from '../util/assert.js';
import {
  createArgumentList,
  createExpressionStatement,
  createIdentifierExpression,
  createIdentifierToken,
  createMemberExpression,
  createObjectLiteralExpression,
  createUseStrictDirective,
  createVariableStatement,
} from './ParseTreeFactory.js';
import {
  parseExpression,
  parsePropertyDefinition,
  parseStatement,
  parseStatements
} from './PlaceholderParser.js';

class DestructImportVarStatement extends DestructuringTransformer {
  createGuardedExpression(tree) {
    return tree;
  }
}

export class ModuleTransformer extends TempVarTransformer {
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   */
  constructor(identifierGenerator, reporter, options) {
    super(identifierGenerator);
    this.options_ = options;
    this.exportVisitor_ = new DirectExportVisitor();
    this.moduleName = null;
  }

  getTempVarNameForModuleName(moduleName) {
    return '$__' + moduleName.replace(/[^a-zA-Z0-9$]/g, function(c) {
      return '_' + c.charCodeAt(0) + '_';
    }) + '__';
  }

  getModuleName(tree) {
    return tree.moduleName;
  }

  getTempVarNameForModuleSpecifier(moduleSpecifier) {
    let normalizedName = System.normalize(moduleSpecifier.token.processedValue, this.moduleName);
    return this.getTempVarNameForModuleName(normalizedName);
  }

  transformScript(tree) {
    this.moduleName = tree.moduleName;
    return super.transformScript(tree);
  }

  transformModule(tree) {
    this.moduleName = this.getModuleName(tree);

    this.pushTempScope();

    let statements = this.transformList(tree.scriptItemList);

    statements = this.appendExportStatement(statements);

    this.popTempScope();

    statements = this.wrapModule(this.moduleProlog().concat(statements));

    return new Script(tree.location, statements);
  }

  moduleProlog() {
    let statements = [createUseStrictDirective()];
    if (this.moduleName) {
      statements.push(parseStatement `var __moduleName = ${this.moduleName};`);
    }
    return statements;
  }

  wrapModule(statements) {
    let functionExpression;
    if (this.options_.transformOptions.require) {
      functionExpression = parseExpression `function(require) {
        ${statements}
      }`;
    } else {
      functionExpression = parseExpression `function() {
        ${statements}
      }`;
    }

    if (this.moduleName === null) {
      return parseStatements
          `$traceurRuntime.ModuleStore.getAnonymousModule(
              ${functionExpression});`;
    }
    return parseStatements
        `System.registerModule(${this.moduleName}, [], ${functionExpression});`;
  }

  /**
   * This creates the code that defines the getter for an export.
   * @param {{string, ParseTree, ModuleSpecifier}} symbol
   * @return {ParseTree}
   */
  getGetterExport({name, tree, moduleSpecifier}) {
    let returnExpression;
    switch (tree.type) {
      case EXPORT_DEFAULT:
        returnExpression = createIdentifierExpression('$__default');
        break;

      case EXPORT_SPECIFIER:
        if (moduleSpecifier) {
          let idName = this.getTempVarNameForModuleSpecifier(moduleSpecifier);
          returnExpression = createMemberExpression(idName, tree.lhs);
        } else {
          returnExpression = createIdentifierExpression(tree.lhs)
        }
        break;

      case NAME_SPACE_EXPORT: {
        let idName = this.getTempVarNameForModuleSpecifier(moduleSpecifier);
        returnExpression = createIdentifierExpression(idName);
        break;
      }

      case FORWARD_DEFAULT_EXPORT: {
        let idName = this.getTempVarNameForModuleSpecifier(moduleSpecifier);
        returnExpression = createMemberExpression(idName, 'default');
        break;
      }

      default:
        returnExpression = createIdentifierExpression(name);
        break;
    }

    return parsePropertyDefinition
        `get ${name}() { return ${returnExpression}; }`;
  }

  getExportProperties() {
    return this.exportVisitor_.namedExports.map((exp) => {
      // export_name: {get: function() { return export_name },
      return this.getGetterExport(exp);
    }).concat(this.exportVisitor_.namedExports.map((exp) => {
      return this.getSetterExport(exp);
    })).filter((e) => e);
  }

  // By default, the module transformer doesn't create setters,
  // as the Module object is read only.
  getSetterExport({name, tree, moduleSpecifier}) {
    return null;
  }

  getExportObject() {
    let exportObject = createObjectLiteralExpression(this.getExportProperties());
    if (this.exportVisitor_.starExports.length) {
      let starExports = this.exportVisitor_.starExports;
      let starIdents = starExports.map((moduleSpecifier) => {
        return createIdentifierExpression(
            this.getTempVarNameForModuleSpecifier(moduleSpecifier));
      });
      let args = createArgumentList([exportObject, ...starIdents]);
      return parseExpression `$traceurRuntime.exportStar(${args})`;
    }
    return exportObject;
  }

  appendExportStatement(statements) {
    let exportObject = this.getExportObject();
    statements.push(parseStatement `return ${exportObject}`);
    return statements;
  }

  /**
   * @return {boolean}
   */
  hasExports() {
    return this.exportVisitor_.hasExports();
  }

  /**
   * @return {boolean}
   */
  hasStarExports() {
    return this.exportVisitor_.starExports.length > 0;
  }

  transformExportDeclaration(tree) {
    this.exportVisitor_.visitAny(tree);
    return this.transformAny(tree.declaration);
  }

  transformExportDefault(tree) {
    switch (tree.expression.type) {
      case CLASS_DECLARATION:
      case FUNCTION_DECLARATION:
        let nameBinding = tree.expression.name;
        let name = createIdentifierExpression(nameBinding.identifierToken);
        return new AnonBlock(null, [
          tree.expression,
          parseStatement `var $__default = ${name}`
        ]);
    }
    return parseStatement `var $__default = ${tree.expression}`;
  }

  transformNamedExport(tree) {
    let moduleSpecifier = tree.moduleSpecifier;

    if (moduleSpecifier) {
      let expression = this.transformAny(moduleSpecifier);
      let idName = this.getTempVarNameForModuleSpecifier(moduleSpecifier);
      return createVariableStatement(VAR, idName, expression);
    }

    return new AnonBlock(null, [])
  }

  /**
   * @param {ModuleSpecifier} tree
   * @return {ParseTree}
   */
  transformModuleSpecifier(tree) {
    assert(this.moduleName);
    let name = tree.token.processedValue;
    // import/module {x} from './name.js' is relative to the current file.
    let normalizedName = System.normalize(name, this.moduleName);
    return parseExpression `System.get(${normalizedName})`;
  }

  transformImportedBinding(tree) {
    let bindingElement = new BindingElement(tree.location, tree.binding, null);
    let name = new LiteralPropertyName(null, createIdentifierToken('default'));
    return new ObjectPattern(null,
        [new ObjectPatternField(null, name, bindingElement)]);
  }

  transformImportDeclaration(tree) {
    // import {id} from 'module'
    //  =>
    // const {id} = moduleInstance
    //
    // import id from 'module'
    //  =>
    // const {default: id} = moduleInstance
    //
    // import 'module'
    //  =>
    // moduleInstance;
    //
    // import * as m from 'module'
    // =>
    // const m = moduleInstance

    // import 'module'
    // import {} from 'module'
    if (!tree.importClause ||
        (tree.importClause.type === IMPORT_SPECIFIER_SET &&
         tree.importClause.specifiers.length === 0)) {
      return createExpressionStatement(this.transformAny(tree.moduleSpecifier));
    }

    let binding = this.transformAny(tree.importClause);
    let initializer = this.transformAny(tree.moduleSpecifier);

    let varStatement = createVariableStatement(VAR, binding, initializer);

    // If destructuring patterns are kept in the output code, keep this as is,
    // otherwise transform it here.
    if (this.options_.transformOptions.destructuring ||
        !this.options_.parseOptions.destructuring) {
      let destructuringTransformer =
          new DestructImportVarStatement(this.identifierGenerator);
      varStatement = varStatement.transform(destructuringTransformer);
    }

    return varStatement;
  }

  transformImportSpecifierSet(tree) {
    let fields = this.transformList(tree.specifiers);
    return new ObjectPattern(null, fields);
  }

  transformNameSpaceImport(tree) {
    return tree.binding.binding;
  }

  transformImportSpecifier(tree) {
    let binding = tree.binding.binding;
    let bindingElement = new BindingElement(binding.location, binding, null);
    if (tree.name) {
      let name = new LiteralPropertyName(tree.name.location, tree.name);
      return new ObjectPatternField(tree.location, name, bindingElement);
    }
    return bindingElement;
  }
}

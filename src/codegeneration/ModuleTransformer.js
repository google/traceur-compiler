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
} from '../syntax/trees/ParseTrees';
import {DestructuringTransformer} from './DestructuringTransformer';
import {DirectExportVisitor} from './module/DirectExportVisitor';
import {TempVarTransformer} from './TempVarTransformer';
import {
  CLASS_DECLARATION,
  EXPORT_DEFAULT,
  EXPORT_SPECIFIER,
  FUNCTION_DECLARATION,
  IMPORT_SPECIFIER_SET
} from '../syntax/trees/ParseTreeType';
import {VAR} from '../syntax/TokenType';
import {assert} from '../util/assert';
import {
  createArgumentList,
  createExpressionStatement,
  createIdentifierExpression,
  createIdentifierToken,
  createMemberExpression,
  createObjectLiteralExpression,
  createUseStrictDirective,
  createVariableStatement,
} from './ParseTreeFactory';
import {
  parseOptions,
  transformOptions
} from '../Options';
import {
  parseExpression,
  parsePropertyDefinition,
  parseStatement,
  parseStatements
} from './PlaceholderParser';

class DestructImportVarStatement extends DestructuringTransformer {
  createGuardedExpression(tree) {
    return tree;
  }
}

export class ModuleTransformer extends TempVarTransformer {
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   */
  constructor(identifierGenerator) {
    super(identifierGenerator);
    this.exportVisitor_ = new DirectExportVisitor();
    this.moduleSpecifierKind_ = null;
    this.moduleName = null;
  }

  getTempVarNameForModuleName(moduleName) {
    return '$__' + moduleName.replace(/[^a-zA-Z0-9$]/g, function(c) {
      return '_' + c.charCodeAt(0) + '_';
    }) + '__';
  }

  getTempVarNameForModuleSpecifier(moduleSpecifier) {
    var normalizedName = System.normalize(moduleSpecifier.token.processedValue, this.moduleName);
    return this.getTempVarNameForModuleName(normalizedName);
  }

  transformScript(tree) {
    this.moduleName = tree.moduleName;
    return super.transformScript(tree);
  }

  transformModule(tree) {
    this.moduleName = tree.moduleName;

    this.pushTempScope();

    var statements = this.transformList(tree.scriptItemList);

    statements = this.appendExportStatement(statements);

    this.popTempScope();

    statements = this.wrapModule(this.moduleProlog().concat(statements));

    return new Script(tree.location, statements);
  }

  moduleProlog() {
    var statements = [createUseStrictDirective()];
    if (this.moduleName)
      statements.push(parseStatement `var __moduleName = ${this.moduleName};`);
    return statements;
  }

  wrapModule(statements) {
    var functionExpression = parseExpression `function() {
      ${statements}
    }`;

    if (this.moduleName === null) {
      return parseStatements
          `$traceurRuntime.ModuleStore.getAnonymousModule(
              ${functionExpression});`;
    }
    return parseStatements
        `System.register(${this.moduleName}, [], ${functionExpression});`;
  }

  /**
   * This creates the code that defines the getter for an export.
   * @param {{string, ParseTree, ModuleSpecifier}} symbol
   * @return {ParseTree}
   */
  getGetterExport({name, tree, moduleSpecifier}) {
    var returnExpression;
    switch (tree.type) {
      case EXPORT_DEFAULT:
        returnExpression = createIdentifierExpression('$__default');
        break;

      case EXPORT_SPECIFIER:
        if (moduleSpecifier) {
          var idName = this.getTempVarNameForModuleSpecifier(moduleSpecifier);
          returnExpression = createMemberExpression(idName, tree.lhs);
        } else {
          returnExpression = createIdentifierExpression(tree.lhs)
        }
        break;

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
    var exportObject = createObjectLiteralExpression(this.getExportProperties());
    if (this.exportVisitor_.starExports.length) {
      var starExports = this.exportVisitor_.starExports;
      var starIdents = starExports.map((moduleSpecifier) => {
        return createIdentifierExpression(
            this.getTempVarNameForModuleSpecifier(moduleSpecifier));
      });
      var args = createArgumentList([exportObject, ...starIdents]);
      return parseExpression `$traceurRuntime.exportStar(${args})`;
    }
    return exportObject;
  }

  appendExportStatement(statements) {
    var exportObject = this.getExportObject();
    statements.push(parseStatement `return ${exportObject}`);
    return statements;
  }

  /**
   * @return {boolean}
   */
  hasExports() {
    return this.exportVisitor_.hasExports();
  }

  transformExportDeclaration(tree) {
    this.exportVisitor_.visitAny(tree);
    return this.transformAny(tree.declaration);
  }

  transformExportDefault(tree) {
    switch (tree.expression.type) {
      case CLASS_DECLARATION:
      case FUNCTION_DECLARATION:
        var nameBinding = tree.expression.name;
        var name = createIdentifierExpression(nameBinding.identifierToken);
        return new AnonBlock(null, [
          tree.expression,
          parseStatement `var $__default = ${name}`
        ]);
    }
    return parseStatement `var $__default = ${tree.expression}`;
  }

  transformNamedExport(tree) {
    var moduleSpecifier = tree.moduleSpecifier;

    if (moduleSpecifier) {
      var expression = this.transformAny(moduleSpecifier);
      var idName = this.getTempVarNameForModuleSpecifier(moduleSpecifier);
      return createVariableStatement(VAR, idName, expression);
    }

    return new EmptyStatement(null);
  }

  /**
   * @param {ModuleSpecifier} tree
   * @return {ParseTree}
   */
  transformModuleSpecifier(tree) {
    assert(this.moduleName);
    var name = tree.token.processedValue;
    // import/module {x} from 'name' is relative to the current file.
    var normalizedName = System.normalize(name, this.moduleName);
    return parseExpression `System.get(${normalizedName})`;
  }

  /**
   * @param {ModuleDeclaration} tree
   * @return {VariableDeclaration}
   */
  transformModuleDeclaration(tree) {
    this.moduleSpecifierKind_ = 'module';
    var initializer = this.transformAny(tree.expression);
    var bindingIdentifier = tree.binding.binding;
    // const a = b.c, d = e.f;
    // TODO(arv): const is not allowed in ES5 strict
    return createVariableStatement(VAR, bindingIdentifier, initializer);
  }

  transformImportedBinding(tree) {
    var bindingElement = new BindingElement(tree.location, tree.binding, null);
    var name = new LiteralPropertyName(null, createIdentifierToken('default'));
    return new ObjectPattern(null,
        [new ObjectPatternField(null, name, bindingElement)]);
  }

  transformImportDeclaration(tree) {
    // import {id} from 'module'
    //  =>
    // var {id} = moduleInstance
    //
    // import id from 'module'
    //  =>
    // var {default: id} = moduleInstance
    //
    // import 'module'
    //  =>
    // moduleInstance;
    this.moduleSpecifierKind_ = 'import';
    if (!tree.importClause ||
        (tree.importClause.type === IMPORT_SPECIFIER_SET &&
         tree.importClause.specifiers.length === 0)) {
      return createExpressionStatement(this.transformAny(tree.moduleSpecifier));
    }

    var binding = this.transformAny(tree.importClause);
    var initializer = this.transformAny(tree.moduleSpecifier);

    var varStatement = createVariableStatement(VAR, binding, initializer);

    // If destructuring patterns are kept in the output code, keep this as is,
    // otherwise transform it here.
    if (transformOptions.destructuring || !parseOptions.destructuring) {
      var destructuringTransformer =
          new DestructImportVarStatement(this.identifierGenerator);
      varStatement = varStatement.transform(destructuringTransformer);
    }

    return varStatement;
  }

  transformImportSpecifierSet(tree) {
    var fields = this.transformList(tree.specifiers);
    return new ObjectPattern(null, fields);
  }

  transformImportSpecifier(tree) {
    var binding = tree.binding.binding;
    var bindingElement = new BindingElement(binding.location, binding, null);
    if (tree.name) {
      var name = new LiteralPropertyName(tree.name.location, tree.name);
      return new ObjectPatternField(tree.location, name, bindingElement);
    }
    return bindingElement;
  }
}

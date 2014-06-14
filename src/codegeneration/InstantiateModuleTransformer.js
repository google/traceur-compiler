// Copyright 2014 Traceur Authors.
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


import {assert} from '../util/assert';
import {
  ClassExpression,
  EmptyStatement,
  NamedExport
} from '../syntax/trees/ParseTrees';
import {
  THIS
} from '../syntax/PredefinedName';
import {
  EXPORT_DEFAULT,
  EXPORT_SPECIFIER,
  EXPORT_STAR
} from '../syntax/trees/ParseTreeType';
import {AlphaRenamer} from './AlphaRenamer';
import {
  createIdentifierExpression,
  createMemberExpression,
  createObjectLiteralExpression
} from './ParseTreeFactory';
import {ModuleTransformer} from './ModuleTransformer';
import {
  parseExpression,
  parsePropertyDefinition,
  parseStatement,
  parseStatements
} from './PlaceholderParser';
import HoistVariablesTransformer from './HoistVariablesTransformer';
import {
  createFunctionExpression,
  createEmptyParameterList,
  createFunctionBody
} from './ParseTreeFactory';

/**
 * Extracts variable and function declarations from the module scope.
 */
class DeclarationExtractionTransformer extends HoistVariablesTransformer {
  constructor(identifierGenerator) {
    super();
    this.identifierGenerator = identifierGenerator
    this.declarations_ = [];
  }
  getDeclarationStatements() {
    return [this.getVariableStatement(), ...this.declarations_];
  }
  addDeclaration(tree) {
    this.declarations_.push(tree);
  }
  transformFunctionDeclaration(tree) {
    this.addDeclaration(tree);
    return new EmptyStatement(null);
  }
  transformClassDeclaration(tree) {
    this.addVariable(tree.name.identifierToken.value);

    // Convert a class declaration into a class expression.
    tree = new ClassExpression(tree.location, tree.name, tree.superClass, tree.elements, tree.annotations);

    return parseStatement `${tree.name.identifierToken} = ${tree}`;
  }
}

/**
 * Renames a given identifier to any new expression.
 */
class ReplaceIdentifierExpressionTransformer extends AlphaRenamer {
  constructor(oldName, newExpression) {
    super();
    this.oldName_ = oldName;
    this.newExpression_ = newExpression;
  }
  transformIdentifierExpression(tree) {
    if (this.oldName_ == tree.identifierToken.value) {
      return this.newExpression_;
    } else {
      return tree;
    }
  }
  transformThisExpression(tree) {
    if (this.oldName_ !== THIS)
      return tree;
    return this.newExpression_;
  }
  static rename(tree, oldName, newExpression) {
    return new ReplaceIdentifierExpressionTransformer(oldName, newExpression).transformAny(tree);
  }
}


/**
 * Transform a module to a 'instantiate' format:
 * System.register(localName, [deps], function(depList) {});
 * where [deps] are unnormalized (module-specifier-like) names
 * and depList is the array of de-duped dependency modules.
 */
export class InstantiateModuleTransformer extends ModuleTransformer {

  constructor(identifierGenerator) {
    super(identifierGenerator);
    this.declarationExtractionTransformer =
        new DeclarationExtractionTransformer(identifierGenerator, this.moduleBindings_);
    this.dependencies = [];
    this.depMapIdentifier = createIdentifierExpression(this.identifierGenerator.generateUniqueIdentifier());
    this.moduleBindings_ = [];
  }

  wrapModule(statements) {
    if (this.moduleName) {
      return parseStatements
        `System.register(${this.moduleName}, ${this.dependencies}, function(${this.depMapIdentifier}) {
          ${statements}
        });`;
    }
    else {
      return parseStatements
        `System.register(${this.dependencies}, function(${this.depMapIdentifier}) {
          ${statements}
        });`;
    }
  }

  /**
   * Create the primary System.register structure, separating
   * declaration bindings from execution for ES6 binding support.
   *
   * Converts:
   *   import {s} from 's';
   *   export {p} from 'q';
   *   q(s);
   *   function q() {
   *     s();
   *   }
   *
   *
   * Hoisting the declarations and writing the exports into:
   *   function q() {
   *     s();
   *   }
   *   return {
   *     exports: {
   *       get p() {
   *         return $__depMap[1].p;
   *       },
   *       set p(value) {
   *         $__depMap[1].p = value;
   *       }
   *     },
   *     execute: function() {
   *       q(s);
   *     }
   *   };
   *
   * Then replace the import binding identifiers into:
   *   function q() {
   *     $__depMap[0]['s']();
   *   }
   *   return {
   *     exports: {
   *       get p() {
   *         return $__depMap[1].p;
   *       },
   *       set p(value) {
   *         $__depMap[1].p = value;
   *       }
   *     },
   *     execute: function() {
   *       q($__depMap[0]['s']);
   *     }
   *   };
   *
   * Note that $__depMap is actually $__0 in output.
   */
  appendExportStatement(statements) {

    // Transform statements into execution statements only, with declarations removed.
    var executionStatements = statements.map(
      (statement) => this.declarationExtractionTransformer.transformAny(statement)
    );

    var executionFunction = createFunctionExpression(
        createEmptyParameterList(),
        createFunctionBody(executionStatements)
    );

    // Extract the declaration statements for hoisting from the previous transform.
    var declarationStatements = this.declarationExtractionTransformer.getDeclarationStatements();

    var exportStarDeps = this.exportVisitor_.starExports.map(
      (moduleSpecifier) => moduleSpecifier.token.processedValue
    );

    if (exportStarDeps.length) {
      declarationStatements.push(parseStatement `return {
        exports: ${this.getExportObject()},
        exportStar: ${exportStarDeps},
        execute: ${executionFunction}
      }`);
    } else {
      declarationStatements.push(parseStatement `return {
        exports: ${this.getExportObject()},
        execute: ${executionFunction}
      }`);
    }

    // Replace import identifiers with an appropriate module member expression.
    // NB one optimization might be to use temporary variables for modules in execute only.
    this.moduleBindings_.forEach((binding) => {
      var moduleMemberExpression = parseExpression
          `${this.depMapIdentifier}[${binding.depIndex}][${binding.importName}]`;

      declarationStatements = declarationStatements.map((statement) =>
        ReplaceIdentifierExpressionTransformer.rename(statement, binding.variableName, moduleMemberExpression)
      );
    });

    return declarationStatements;
  }

  getExportObject() {
    return createObjectLiteralExpression(this.getExportProperties());
  }

  addModuleBinding(moduleBinding) {
    this.moduleBindings_.push(moduleBinding);
  }

  getOrCreateDependencyIndex(moduleSpecifier) {
    var name = moduleSpecifier.token.processedValue;

    var depIndex = this.dependencies.indexOf(name);

    if (depIndex == -1) {
      depIndex = this.dependencies.length;
      this.dependencies.push(name);
    }
    return depIndex;
  }
  /**
   * For
   *  import {foo} from './foo';
   * transform the './foo' part to
   *  $__depMap[n];
   * where n is the dependency index.
   *
   * @param {ModuleSpecifier} tree
   * @return {ParseTree}
   */
  transformModuleSpecifier(tree) {
    var depIndex = this.getOrCreateDependencyIndex(tree);

    return parseExpression `${this.depMapIdentifier}[${depIndex}]`;
  }

  getExportExpression({name, tree, moduleSpecifier}) {
    switch (tree.type) {
      case EXPORT_DEFAULT:
        return createIdentifierExpression('$__default');

      case EXPORT_SPECIFIER:
        if (moduleSpecifier) {
          return createMemberExpression(moduleSpecifier, tree.lhs);
        }

        return createIdentifierExpression(tree.lhs);

      default:
        return createIdentifierExpression(name);
    }
  }

  getSetterExport(exp) {
    return parsePropertyDefinition `set ${exp.name}(value) { ${this.getExportExpression(exp)} = value; }`;
  }

  getGetterExport(exp) {
    return parsePropertyDefinition `get ${exp.name}() { return ${this.getExportExpression(exp)}; }`;
  }

  transformExportDeclaration(tree) {
    // Transform function, variable, class and default export declarations.
    if (!tree.declaration.specifierSet) {
      this.exportVisitor_.visitAny(tree);
      return this.transformAny(tree.declaration);
    }

    // All other declarations are visited then removed.
    if (tree.declaration.specifierSet.type != EXPORT_STAR) {
      tree.declaration = this.transformAny(tree.declaration);
      tree.annotations = this.transformList(tree.annotations);
    }
    this.exportVisitor_.visitAny(tree);

    return new EmptyStatement(null);
  }

  transformNamedExport(tree) {
    var moduleSpecifier = this.transformAny(tree.moduleSpecifier);
    var specifierSet = this.transformAny(tree.specifierSet);
    if (moduleSpecifier === tree.moduleSpecifier && specifierSet === tree.specifierSet) {
      return tree;
    }
    return new NamedExport(tree.location, moduleSpecifier, specifierSet);
  }

  transformImportDeclaration(tree) {
    this.moduleSpecifierKind_ = 'import';

    this.curDepIndex_ = this.getOrCreateDependencyIndex(tree.moduleSpecifier);

    this.transformAny(tree.importClause);

    return new EmptyStatement(tree.location);
  }

  transformImportedBinding(tree) {
    this.addModuleBinding({
      variableName: tree.binding.identifierToken.value,
      depIndex: this.curDepIndex_,
      importName: 'default'
    });
    return tree;
  }

  transformImportSpecifier(tree) {
    var importName;
    var localName;

    if (tree.rhs) {
      localName = tree.rhs.value;
      importName = tree.lhs.value;
    } else {
      localName = importName = tree.lhs.value;
    }

    this.addModuleBinding({
      variableName: localName,
      depIndex: this.curDepIndex_,
      importName: importName
    });
  }
}

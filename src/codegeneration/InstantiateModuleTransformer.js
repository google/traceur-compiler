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

import {
  AnonBlock,
  ArrayLiteralExpression,
  ClassExpression,
  CommaExpression,
  ExpressionStatement
} from '../syntax/trees/ParseTrees';
import {
  CLASS_DECLARATION,
  FUNCTION_DECLARATION,
  IDENTIFIER_EXPRESSION,
  IMPORT_SPECIFIER_SET
} from '../syntax/trees/ParseTreeType';
import {ScopeTransformer} from './ScopeTransformer';
import {
  createIdentifierExpression as id,
  createIdentifierToken,
  createVariableStatement,
  createVariableDeclaration,
  createVariableDeclarationList
} from './ParseTreeFactory';
import {ModuleTransformer} from './ModuleTransformer';
import {
  MINUS_MINUS,
  PLUS_PLUS,
  VAR
} from '../syntax/TokenType';
import {
  parseExpression,
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
  constructor() {
    super();
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
    return new AnonBlock(null, []);
  }
  transformClassDeclaration(tree) {
    this.addVariable(tree.name.identifierToken.value);

    // Convert a class declaration into a class expression.
    tree = new ClassExpression(tree.location, tree.name, tree.superClass, tree.elements, tree.annotations);

    return parseStatement `${tree.name.identifierToken} = ${tree}`;
  }
}

/**
 * Replaces assignments of an identifier with an update function to update
 * dependent modules
 *
 * a = b
 * a++
 * --a
 * var a = b
 * =>
 * $__export('a', a = b)
 * a++, $__export('a', a);
 * $__export('a', a++);
 * $__export('a', --a);
 * var a = $__export('a', b)
 *
 * TODO: Destructuring Support, since module transformer runs before destructuring
 *
 */
class InsertBindingAssignmentTransformer extends ScopeTransformer {
  constructor(exportName, bindingName) {
    super(bindingName);
    this.bindingName_ = bindingName;
    this.exportName_ = exportName;
  }

  matchesBindingName_(binding) {
    return binding.type === IDENTIFIER_EXPRESSION &&
        binding.identifierToken.value == this.bindingName_;
  }

  // ++x
  // --x
  // =>
  // $__export('x', ++x)
  transformUnaryExpression(tree) {
    if (!this.matchesBindingName_(tree.operand))
      return super.transformUnaryExpression(tree);

    var operatorType = tree.operator.type;
    if (operatorType !== PLUS_PLUS && operatorType !== MINUS_MINUS)
      return super.transformUnaryExpression(tree);

    var operand = this.transformAny(tree.operand);
    if (operand !== tree.operand)
      tree = new UnaryExpression(tree.location, tree.operator, operand);

    return parseExpression `$__export(${this.exportName_}, ${tree})`;
  }

  // x++
  // =>
  // ($__export('x', x + 1), x++)
  transformPostfixExpression(tree) {
    tree = super.transformPostfixExpression(tree);

    if (!this.matchesBindingName_(tree.operand))
      return tree;

    switch (tree.operator.type) {
      case PLUS_PLUS:
        return parseExpression
            `($__export(${this.exportName_}, ${tree.operand} + 1), ${tree})`;
      case MINUS_MINUS:
        return parseExpression
            `($__export(${this.exportName_}, ${tree.operand} - 1), ${tree})`;
    }
    return tree;
  }

  // x = y
  // =>
  // $__export('x', x = y);
  transformBinaryExpression(tree) {
    tree = super.transformBinaryExpression(tree);

    if (!tree.operator.isAssignmentOperator())
      return tree;

    if (!this.matchesBindingName_(tree.left))
      return tree;

    return parseExpression `$__export(${this.exportName_}, ${tree})}`;
  }
}

/**
 * Transform a module to a 'instantiate' format:
 * System.register(localName, [deps], function($__export) {});
 * where [deps] are unnormalized (module-specifier-like) names
 * and $__export is the dynamic export binding setter function.
 */
export class InstantiateModuleTransformer extends ModuleTransformer {

  constructor(identifierGenerator) {
    super(identifierGenerator);

    this.inExport_ = false;
    this.curDepIndex_ = null;

    this.dependencies = [];

    // export bindings from other modules
    // export {p as q} from 'r';
    // array of arrays, keyed by dependency index
    this.externalExportBindings = [];

    // local import bindings
    // import {s} from 't';
    // array of arrays, keyed by dependency index
    this.importBindings = [];

    // local export bindings
    // export {p as q}
    // array of bindings
    this.localExportBindings = [];

    // function declaration bindings
    // export function q() {}
    // export default function q() {}
    // array of bindings
    this.functionDeclarations = [];

    // module declaration bindings
    // import * as P from 'q';
    // string array keyed by dependency index
    this.moduleBindings = [];

    // whether this module has an export star
    // boolean array keyed by dependency index
    this.exportStarBindings = [];
  }

  wrapModule(statements) {
    if (this.moduleName) {
      return parseStatements
        `System.register(${this.moduleName}, ${this.dependencies}, function($__export) {
          ${statements}
        });`;
    } else {
      return parseStatements
        `System.register(${this.dependencies}, function($__export) {
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
   *   export {p as t, s} from 'q';
   *   export * from 'r';
   *   q(s);
   *   function q() {
   *     s();
   *   }
   *
   * Hoisting the declarations and writing the exports into:
   *
   * System.register("name", ["s", "q", "r"], function($__export) {
   *   var s;
   *   function q() {
   *     s();
   *   }
   *   return {
   *     setters: [
   *       function(m) {
   *         $__export('t', m['p']);
   *         $__export('s', m['s']);
   *       },
   *       function(m) {
   *         s = m['s'];
   *       },
   *       function(m) {
   *         for (var p in m)
   *           $__export(p, m[p]);
   *       }
   *     ],
   *     execute: function() {
   *       q(s);
   *     }
   *   };
   * });
   *
   */
  appendExportStatement(statements) {

    var declarationExtractionTransformer = new DeclarationExtractionTransformer();

    // replace local export assignments with binding functions
    // using InsertBindingAssignmentTransformer
    this.localExportBindings.forEach((binding) => {
      statements = new InsertBindingAssignmentTransformer(
          binding.exportName, binding.localName).transformList(statements);
    });

    // Transform statements into execution statements only, with declarations removed.
    var executionStatements = statements.map(
      (statement) => declarationExtractionTransformer.transformAny(statement)
    );

    var executionFunction = createFunctionExpression(
        createEmptyParameterList(),
        createFunctionBody(executionStatements)
    );

    // Extract the declaration statements for hoisting from the previous transform.
    var declarationStatements = declarationExtractionTransformer.getDeclarationStatements();

    // create the setter bindings
    var setterFunctions = this.dependencies.map((dep, index) => {
      var importBindings = this.importBindings[index];
      var externalExportBindings = this.externalExportBindings[index];
      var exportStarBinding = this.exportStarBindings[index];
      var moduleBinding = this.moduleBindings[index];

      var setterStatements = [];

      // first set local import bindings for the current dependency
      if (importBindings) {
        importBindings.forEach((binding) => {
          setterStatements.push(
            parseStatement `${createIdentifierToken(binding.variableName)} = m.${binding.exportName};`
          );
        });
      }

      // then do export bindings of re-exported dependencies
      if (externalExportBindings) {
        externalExportBindings.forEach((binding) => {
          setterStatements.push(
            parseStatement `$__export(${binding.exportName}, m.${binding.importName});`
          );
        });
      }

      // create local module bindings
      if (moduleBinding) {
        setterStatements.push(
          parseStatement `${id(moduleBinding)} = m;`
        );
      }

      // finally run export * if applying to this dependency
      if (exportStarBinding) {
        setterStatements = setterStatements.concat(parseStatements `
          Object.keys(m).forEach(function(p) {
            $__export(p, m[p]);
          });
        `);
      }

      if (setterStatements.length) {
        return parseExpression `function(m) {
          ${setterStatements}
        }`;
      }
      else {
        return parseExpression `function(m) {}`;
      }
    });

    // add function declaration assignments for hoisted function exports
    declarationStatements = declarationStatements.concat(this.functionDeclarations.map((binding) => {
      return parseStatement `
        $__export(${binding.exportName}, ${createIdentifierToken(binding.functionName)})
      `;
    }));

    declarationStatements.push(parseStatement `return {
      setters: ${new ArrayLiteralExpression(null, setterFunctions)},
      execute: ${executionFunction}
    }`);

    return declarationStatements;
  }


  // Add a new local binding
  addLocalExportBinding(exportName, localName = exportName) {
    this.localExportBindings.push({
      exportName: exportName,
      localName: localName
    });
  }


  // Add a new local binding for a given dependency index
  // import {p as q} from 't';
  addImportBinding(depIndex, variableName, exportName) {
    this.importBindings[depIndex] = this.importBindings[depIndex] || [];
    this.importBindings[depIndex].push({
      variableName: variableName,
      exportName: exportName
    });
  }
  // Add a new export binding for a given dependency index
  // export {a as p} from 'q';
  addExternalExportBinding(depIndex, exportName, importName) {
    this.externalExportBindings[depIndex] = this.externalExportBindings[depIndex] || [];
    this.externalExportBindings[depIndex].push({
      exportName: exportName,
      importName: importName
    });
  }
  // Note that we have an export * for a dep index
  addExportStarBinding(depIndex) {
    this.exportStarBindings[depIndex] = true;
  }
  // Add a new module binding
  // import * as P from 'q';
  addModuleBinding(depIndex, variableName) {
    this.moduleBindings[depIndex] = variableName;
  }

  // Add a new assignment of a hoisted function declaration
  // export function p() {}
  // export default function q() {}
  addExportFunction(exportName, functionName = exportName) {
    this.functionDeclarations.push({
      exportName: exportName,
      functionName: functionName
    });
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

  transformExportDeclaration(tree) {
    this.inExport_ = true;

    if (tree.declaration.moduleSpecifier) {
      this.curDepIndex_ = this.getOrCreateDependencyIndex(tree.declaration.moduleSpecifier);
    } else {
      this.curDepIndex_ = null;
    }

    var transformed = this.transformAny(tree.declaration);
    this.inExport_ = false;
    return transformed;
  }

  // export var p = 5, q;
  // =>
  // var p = $__export('p', 5), q = $__export('q', q);
  transformVariableStatement(tree) {
    if (!this.inExport_)
      return super.transformVariableStatement(tree);

    this.inExport_ = false;

    return createVariableStatement(createVariableDeclarationList(VAR,
        tree.declarations.declarations.map((declaration) => {
      var varName = declaration.lvalue.identifierToken.value;
      var initializer;
      this.addLocalExportBinding(varName);
      if (declaration.initializer)
        initializer = parseExpression `$__export(${varName}, ${this.transformAny(declaration.initializer)})`;
      else
        initializer = parseExpression `$__export(${varName}, ${id(varName)})`;
      return createVariableDeclaration(varName, initializer);
    })));
  }

  transformExportStar(tree) {
    this.inExport_ = false;
    this.addExportStarBinding(this.curDepIndex_);
    return new AnonBlock(null, []);
  }

  // export class q {}
  // =>
  // var q = $__export('q', class q {})
  transformClassDeclaration(tree) {
    if (!this.inExport_)
      return super.transformClassDeclaration(tree);

    this.inExport_ = false;

    var name = this.transformAny(tree.name);
    var superClass = this.transformAny(tree.superClass);
    var elements = this.transformList(tree.elements);
    var annotations = this.transformList(tree.annotations);

    var varName = name.identifierToken.value;
    // convert into class expression
    var classExpression = new ClassExpression(tree.location, name, superClass, elements, annotations);
    this.addLocalExportBinding(varName);
    return parseStatement `var ${varName} = $__export(${varName}, ${classExpression});`;
  }

  // export function q() {}
  // =>
  // function q() {}
  // (functions are hoisted and assigned exports shortly)
  transformFunctionDeclaration(tree) {
    // simply note the function declaration to do assignment in the declaration phase later
    if (this.inExport_) {
      var name = tree.name.getStringValue();
      this.addLocalExportBinding(name);
      this.addExportFunction(name);
      this.inExport_ = false;
    }
    return super.transformFunctionDeclaration(tree);
  }

  transformNamedExport(tree) {
    // visit the module specifier, which sets the current dependency index
    this.transformAny(tree.moduleSpecifier);

    var specifierSet = this.transformAny(tree.specifierSet);

    if (this.curDepIndex_ === null) {
      // if it is an export statement, it just becomes the variable declarations
      return specifierSet;
    } else {
      // if it is a re-export, it becomes empty
      return new AnonBlock(null, []);
    }
  }

  transformImportDeclaration(tree) {
    // import {id} from 'module'
    // import id from 'module'
    //  =>
    // var id;
    //
    // import {id, id2 as newid} from 'module'
    // =>
    // var id, newid;
    //
    // import 'module'
    // =>
    // <empty>
    //
    //
    //
    this.curDepIndex_ = this.getOrCreateDependencyIndex(tree.moduleSpecifier);

    var initializer = this.transformAny(tree.moduleSpecifier);

    if (!tree.importClause)
      return new AnonBlock(null, []);

    // visit the import clause to store the bindings
    var importClause = this.transformAny(tree.importClause);

    if (tree.importClause.type === IMPORT_SPECIFIER_SET) {
      // loop each specifier generating the variable declaration list
      return importClause;
    } else {
      // import default form
      var bindingName = tree.importClause.binding.getStringValue();
      this.addImportBinding(this.curDepIndex_, bindingName, 'default');
      return parseStatement `var ${bindingName};`;
    }

    return new AnonBlock(null, []);
  }

  transformImportSpecifierSet(tree) {
    return createVariableStatement(
        createVariableDeclarationList(VAR, this.transformList(tree.specifiers)));
  }


  transformExportDefault(tree) {
    //
    // export default function p() {}
    // =>
    // function p() {}
    //
    // export default class Q ...
    // =>
    // $__export('default', ...expression...)
    // (classes don't hoist)
    //
    // export default ...
    // =>
    // $__export('default', ...)
    //
    this.inExport_ = false;
    var expression = this.transformAny(tree.expression);
    this.addLocalExportBinding('default');

    // convert class into a class expression
    if (expression.type === CLASS_DECLARATION) {
      expression = new ClassExpression(expression.location, expression.name, 
          expression.superClass, expression.elements, expression.annotations);
    }

    if (expression.type === FUNCTION_DECLARATION) {
      this.addExportFunction('default', expression.name.identifierToken.value);
      return expression;
    } else {
      return parseStatement `$__export('default', ${expression});`;
    }
  }

  transformExportSpecifier(tree) {
    var exportName;
    var bindingName;

    if (tree.rhs) {
      exportName = tree.rhs.value;
      bindingName = tree.lhs.value;
    } else {
      exportName = tree.lhs.value;
      bindingName = exportName;
    }

    if (this.curDepIndex_ !== null) {
      this.addExternalExportBinding(this.curDepIndex_, exportName, bindingName);
    } else {
      this.addLocalExportBinding(exportName, bindingName);
      return parseExpression `$__export(${exportName}, ${id(bindingName)});`;
    }
  }

  // export {a, b as c}
  // =>
  // $__export('a', a), $__export('c', b);
  transformExportSpecifierSet(tree) {
    var specifiers = this.transformList(tree.specifiers);
    return new ExpressionStatement(tree.location,
      new CommaExpression(tree.location, specifiers.filter((specifier) => specifier)));
  }

  transformImportSpecifier(tree) {
    var localBinding = tree.binding.binding;
    var localBindingToken = localBinding.identifierToken;
    var importName = (tree.name || localBindingToken).value;
    this.addImportBinding(this.curDepIndex_, localBindingToken.value, importName);
    return createVariableDeclaration(localBinding);
  }

  transformModuleDeclaration(tree) {
    // we visit the declaration only
    this.transformAny(tree.expression);
    var bindingIdentifier = tree.binding.binding;
    var name = bindingIdentifier.getStringValue();
    this.addModuleBinding(this.curDepIndex_, name);
    return parseStatement `var ${bindingIdentifier};`;
  }

  transformModuleSpecifier(tree) {
    this.curDepIndex_ = this.getOrCreateDependencyIndex(tree);
    return tree;
  }
}

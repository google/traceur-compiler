// Copyright 2013 Traceur Authors.
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

import {ModuleTransformer} from './ModuleTransformer.js';
import {
  CALL_EXPRESSION,
  GET_ACCESSOR,
  OBJECT_LITERAL,
  PROPERTY_NAME_ASSIGNMENT,
  RETURN_STATEMENT
} from '../syntax/trees/ParseTreeType.js';
import {
  ArgumentList,
  CallExpression,
  ExpressionStatement
} from '../syntax/trees/ParseTrees.js';
import {assert} from '../util/assert.js';
import globalThis from './globalThis.js';
import {
  parseExpression,
  parsePropertyDefinition,
  parseStatements
} from './PlaceholderParser.js';
import scopeContainsThis from './scopeContainsThis.js';
import {
  createEmptyParameterList,
  createFunctionExpression,
  createIdentifierExpression,
  createObjectLiteral,
  createPropertyNameAssignment,
  createVariableStatement,
  createVariableDeclaration,
  createVariableDeclarationList
} from './ParseTreeFactory.js';
import {VAR} from '../syntax/TokenType.js';

export class CommonJsModuleTransformer extends ModuleTransformer {

  constructor(identifierGenerator, reporter, options = undefined) {
    super(identifierGenerator, reporter, options);
    this.moduleVars_ = [];
    this.anonymousModule =
        options && !options.bundle && options.moduleName !== true;
  }

  getModuleName(tree) {
    if (this.anonymousModule)
      return null;
    return tree.moduleName;
  }

  moduleProlog() {
    let statements = super.moduleProlog();

    // declare temp vars in prolog
    if (this.moduleVars_.length) {
      let tmpVarDeclarations = createVariableStatement(createVariableDeclarationList(VAR,
          this.moduleVars_.map((varName) => createVariableDeclaration(varName, null))));

      statements.push(tmpVarDeclarations);
    }

    return statements;
  }

  wrapModule(statements) {

    let needsIife = statements.some(scopeContainsThis);

    if (needsIife) {
      return parseStatements
          `module.exports = function() {
            ${statements}
          }.call(${globalThis()});`;
    }

    let last = statements[statements.length - 1];
    statements = statements.slice(0, -1);
    assert(last.type === RETURN_STATEMENT);
    let exportExpression = last.expression;

    // If the module doesn't use any export statements, nor global "this", it
    // might be because it wants to make its own changes to "exports" or
    // "module.exports", so we don't append "module.exports = {}" to the output.
    if (this.hasExports()) {
      let exportStatement =
          this.transformExportExpressionToModuleExport(exportExpression);
      statements = statements.concat(exportStatement);
    }
    return statements;
  }

  transformExportExpressionToModuleExport(tree) {
    let expression;

    // $traceurRuntime.exportStar({}, ...)
    if (tree.type === CALL_EXPRESSION) {
      let descriptors =
          this.transformObjectLiteralToDescriptors(tree.args.args[0]);
      let object = parseExpression
          `Object.defineProperties(module.exports, ${descriptors})`;
      let newArgs = new ArgumentList(tree.args.location,
                                     [object, ...tree.args.args.slice(1)])
      expression = new CallExpression(tree.location, tree.operand, newArgs);
    } else {
      let descriptors = this.transformObjectLiteralToDescriptors(tree);
      expression = parseExpression
          `Object.defineProperties(module.exports, ${descriptors})`;
    }

    return new ExpressionStatement(expression.location, expression);
  }

  transformObjectLiteralToDescriptors(literalTree) {
    assert(literalTree.type === OBJECT_LITERAL);

    let props = literalTree.propertyNameAndValues.map((exp) => {
      let descriptor;

      switch (exp.type) {
        case GET_ACCESSOR: {
          let getterFunction = createFunctionExpression(createEmptyParameterList(), exp.body);
          descriptor = parseExpression `{get: ${getterFunction}}`;
          break;
        }

        case PROPERTY_NAME_ASSIGNMENT:
          descriptor = parseExpression `{value: ${exp.value}}`;
          break;

        default:
          throw new Error(`Unexpected property type ${exp.type}`);
      }

      return createPropertyNameAssignment(exp.name, descriptor);
    });

    return createObjectLiteral(props);
  }

  transformModuleSpecifier(tree) {
    let moduleName = tree.token.processedValue;
    let tmpVar = this.getTempVarNameForModuleSpecifier(tree);
    this.moduleVars_.push(tmpVar);
    let tvId = createIdentifierExpression(tmpVar);

    // require the module, if it is not marked as an ES6 module, treat it as { default: module }
    // this allows for an unlinked CommonJS / ES6 interop
    // note that future implementations should also check for native Module with
    //   Reflect.isModule or similar
    return parseExpression `(${tvId} = require(${moduleName}),
        ${tvId} && ${tvId}.__esModule && ${tvId} || {default: ${tvId}})`;
  }

  getExportProperties() {
    let properties = super.getExportProperties();

    if (this.exportVisitor_.hasExports())
      properties.push(parsePropertyDefinition `__esModule: true`);
    return properties;
  }
}

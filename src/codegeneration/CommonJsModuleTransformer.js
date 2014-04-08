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

import {ModuleTransformer} from './ModuleTransformer';
import {
  GET_ACCESSOR,
  OBJECT_LITERAL_EXPRESSION,
  PROPERTY_NAME_ASSIGNMENT,
  RETURN_STATEMENT
} from '../syntax/trees/ParseTreeType';
import {assert} from '../util/assert';
import globalThis from './globalThis';
import {
  parseExpression,
  parsePropertyDefinition,
  parseStatement,
  parseStatements
} from './PlaceholderParser';
import scopeContainsThis from './scopeContainsThis';
import {
  createEmptyParameterList,
  createFunctionExpression,
  createObjectLiteralExpression,
  createPropertyNameAssignment
} from './ParseTreeFactory';
import {prependStatements} from './PrependStatements';

export class CommonJsModuleTransformer extends ModuleTransformer {

  wrapModule(statements) {
    var needsIife = statements.some(scopeContainsThis);

    if (needsIife) {
      return parseStatements
          `module.exports = function() {
            ${statements}
          }.call(${globalThis()});`;
    }

    var last = statements[statements.length - 1];
    statements = statements.slice(0, -1);
    assert(last.type === RETURN_STATEMENT);
    var exportObject = last.expression;

    // If the module doesn't use any export statements, nor global "this", it
    // might be because it wants to make its own changes to "exports" or
    // "module.exports", so we don't append "module.exports = {}" to the output.
    if (this.hasExports()) {
      var descriptors = this.transformObjectLiteralToDescriptors(exportObject);
      var exportStatement = parseStatement `Object.defineProperties(exports, ${descriptors});`;
      statements = prependStatements(statements, exportStatement);
    }
    return statements;
  }

  transformObjectLiteralToDescriptors(literalTree) {
    assert(literalTree.type === OBJECT_LITERAL_EXPRESSION);

    var props = literalTree.propertyNameAndValues.map((exp) => {
      var descriptor;

      switch (exp.type) {
        case GET_ACCESSOR:
          var getterFunction = createFunctionExpression(createEmptyParameterList(), exp.body);
          descriptor = parseExpression `{get: ${getterFunction}}`;
          break;

        case PROPERTY_NAME_ASSIGNMENT:
          descriptor = parseExpression `{value: ${exp.value}}`;
          break;

        default:
          throw new Error(`Unexpected property type ${exp.type}`);
      }

      return createPropertyNameAssignment(exp.name, descriptor);
    });

    return createObjectLiteralExpression(props);
  }

  transformModuleSpecifier(tree) {
    return parseExpression `require(${tree.token})`;
  }

  getExportProperties() {
    var properties = super();

    if (this.exportVisitor_.hasExports())
      properties.push(parsePropertyDefinition `__esModule: true`);
    return properties;
  }
}

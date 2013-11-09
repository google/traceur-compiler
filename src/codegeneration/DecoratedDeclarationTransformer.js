// Copyright 2012 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {ParseTreeTransformer} from './ParseTreeTransformer.js';
import {
  CallExpression,
  ClassDeclaration,
  FunctionDeclaration,
  ExportDeclaration
} from '../syntax/trees/ParseTrees';
import {
  createArgumentList,
  createCallExpression,
  createExpressionStatement,
  createObjectLiteralExpression,
  createPropertyNameAssignment,
  createScript
} from './ParseTreeFactory.js';

/**
 * Decorator extension  
 *
 */
export class DecoratedDeclarationTransformer extends ParseTreeTransformer {
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {RuntimeInliner} runtimeInliner
   * @param {ErrorReporter} reporter
   */
  constructor(identifierGenerator, runtimeInliner, reporter) {
    super();
    this.identifierGenerator_ = identifierGenerator;
    this.runtimeInliner_ = runtimeInliner;
    this.reporter_ = reporter;
  }

  transformDecoratedDeclaration(tree) {    
    var statements = [tree.declaration];
    var context = tree.declaration;
    var contextExpression;

    if (context instanceof ExportDeclaration) {
      context = tree.declaration.declaration;
    }
    

    contextExpression = this.createContextExpression_(context);;
    for (var decorator of tree.decorations) {      
      // TODO inject context
      console.log(decorator.toJSON());
      if (decorator.expression instanceof CallExpression) {
        decorator.expression.args.args.unshift(contextExpression);
      } else {
        decorator = createCallExpression(decorator, createArgumentList([contextExpression]));
      }

      statements.push(createExpressionStatement(decorator));
    }

    return createScript(statements);
  }


  createContextExpression_(context) {
    var contextProperties = [];
    contextProperties.push(createPropertyNameAssignment('target', context.name));
    return createObjectLiteralExpression(contextProperties);
  }
  
  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {RuntimeInliner} runtimeInliner
   * @param {ErrorReporter} reporter
   * @param {Script} tree
   * @return {Script}
   */
  static transformTree(identifierGenerator, runtimeInliner, reporter, tree) {
    return new DecoratedDeclarationTransformer(identifierGenerator, runtimeInliner, reporter).transformAny(tree);
  }
}
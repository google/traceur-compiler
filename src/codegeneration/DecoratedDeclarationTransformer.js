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
  CALL_EXPRESSION,
  EXPORT_DECLARATION
} from '../syntax/trees/ParseTreeType';
import {
  createCallDecoratorStatement,
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
   * @param {ErrorReporter} reporter
   */
  constructor(reporter) {
    super();
    this.reporter_ = reporter;
  }

  transformDecoratedDeclaration(tree) {    
    var declaration = tree.declaration;
    var contextExpression, statements;

    if (declaration.type === EXPORT_DECLARATION) {
      declaration = tree.declaration.declaration;
    }
    
    contextExpression = this.createContextExpression_(declaration);

    statements = tree.decorations.map((decorator) => {
      return createCallDecoratorStatement(contextExpression, decorator);
    });

    statements.unshift(declaration);
    return createScript(statements);
  }


  createContextExpression_(context) {
    var contextProperties = [];
    contextProperties.push(createPropertyNameAssignment('target', context.name));
    return createObjectLiteralExpression(contextProperties);
  }

  /**
   * @param {ErrorReporter} reporter
   * @param {Script} tree
   * @return {Script}
   */
  static transformTree(reporter, tree) {
    return new DecoratedDeclarationTransformer(reporter).transformAny(tree);
  }
}
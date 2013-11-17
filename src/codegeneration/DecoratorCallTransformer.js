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
  ClassDeclaration,
  FunctionDeclaration,
  ExportDeclaration
} from '../syntax/trees/ParseTrees';
import {
  CALL_EXPRESSION,
  MEMBER_EXPRESSION
} from '../syntax/trees/ParseTreeType';
import {
  createArgumentList,
  createCallExpression,
} from './ParseTreeFactory.js';

/**
 * Decorator extension  
 *
 */
export class DecoratorCallTransformer extends ParseTreeTransformer {
  /**
   * @param {ErrorReporter} reporter
   */
  constructor(reporter) {
    super();
    this.reporter_ = reporter;
  }

  transformCallDecoratorExpression(tree) { 
    var expression = tree.decorator.expression;

    if (expression.type === CALL_EXPRESSION) {
      while (expression.operand.type === MEMBER_EXPRESSION && 
        expression.operand.operand.type === CALL_EXPRESSION) {
        expression = expression.operand.operand;
      }

      expression.args.args.unshift(tree.context);
      return tree.decorator.expression;
    } 

    return createCallExpression(expression, createArgumentList([tree.context]));
  }

  /**
   * @param {ErrorReporter} reporter
   * @param {Script} tree
   * @return {Script}
   */
  static transformTree(reporter, tree) {
    return new DecoratorCallTransformer(reporter).transformAny(tree);
  }
}
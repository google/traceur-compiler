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

import {AtNameExpression} from '../syntax/trees/ParseTrees.js';
import {
  DELETE_PROPERTY,
  GET_PROPERTY,
  RUNTIME,
  SET_PROPERTY,
  TRACEUR_RUNTIME
} from '../syntax/PredefinedName.js';
import {MEMBER_EXPRESSION} from '../syntax/trees/ParseTreeType.js';
import {TempVarTransformer} from './TempVarTransformer.js';
import {
  AT_NAME,
  DELETE,
  EQUAL
} from '../syntax/TokenType.js';
import {
  createArgumentList,
  createAssignmentExpression,
  createCallCall,
  createCallExpression,
  createCommaExpression,
  createIdentifierExpression,
  createMemberExpression,
  createParenExpression
} from './ParseTreeFactory.js';
import {expandMemberExpression} from './OperatorExpander.js';

/**
 * Transforms expr.@name into traceurRuntime.getProperty(expr, @name). It
 * also transforms []= and the delete operator in similar fashion.
 *
 * This pass is used for private name syntax.
 *
 * http://wiki.ecmascript.org/doku.php?id=strawman:syntactic_support_for_private_names
 */
export class AtNameMemberTransformer extends TempVarTransformer {

  transformBinaryOperator(tree) {
    if (tree.left.type === MEMBER_EXPRESSION &&
        tree.left.memberName.type === AT_NAME &&
        tree.operator.isAssignmentOperator()) {

      if (tree.operator.type !== EQUAL) {
        tree = expandMemberExpression(tree, this);
        return this.transformAny(tree);
      }

      var operand = this.transformAny(tree.left.operand);
      var memberName = tree.left.memberName;
      var atNameExpression = new AtNameExpression(memberName.location,
                                                  memberName);
      var value = this.transformAny(tree.right);

      // operand.@name = value
      // =>
      // traceurRuntime.setProperty(operand, memberExpr, value)
      return createCallExpression(
          createMemberExpression(TRACEUR_RUNTIME, SET_PROPERTY),
          createArgumentList(operand, atNameExpression, value));
    }

    return super.transformBinaryOperator(tree);
  }

  transformCallExpression(tree) {
    if (tree.operand.type !== MEMBER_EXPRESSION ||
        tree.operand.memberName.type !== AT_NAME)
      return super.transformCallExpression(tree);

    var operand = this.transformAny(tree.operand.operand);
    var memberName = tree.operand.memberName;

    // operand.@name(args)
    // =>
    // ($tmp = operand,
    //  traceurRuntime.getProperty($tmp, @name).call($tmp, args))

    var ident = createIdentifierExpression(this.addTempVar());
    var elements = tree.args.args.map(this.transformAny, this);
    var atNameExpression = new AtNameExpression(memberName.location,
                                                memberName);
    var callExpr = createCallCall(
        createCallExpression(
          createMemberExpression(TRACEUR_RUNTIME, GET_PROPERTY),
          createArgumentList(ident, atNameExpression)),
        ident,
        elements);

    var expressions = [
      createAssignmentExpression(ident, operand),
      callExpr
    ];

    return createParenExpression(createCommaExpression(expressions));
  }

  transformMemberExpression(tree) {
    if (tree.memberName.type !== AT_NAME)
      return super.transformMemberExpression(tree);

    // operand.@name
    // =>
    // traceurRuntime.getProperty(operand, @name)
    var atNameExpression = new AtNameExpression(tree.memberName.location,
                                               tree.memberName);
    return createCallExpression(
        createMemberExpression(TRACEUR_RUNTIME, GET_PROPERTY),
        createArgumentList(tree.operand, atNameExpression));
  }

  transformUnaryExpression(tree) {
    if (tree.operator.type !== DELETE ||
        tree.operand.type !== MEMBER_EXPRESSION ||
        tree.operand.memberName.type !== AT_NAME) {
      return super.transformUnaryExpression(tree);
    }

    var operand = this.transformAny(tree.operand.operand);
    var memberName = tree.operand.memberName;
    var atNameExpression = new AtNameExpression(memberName.location,
                                                memberName);

    // delete operand.@name
    // =>
    // traceurRuntime.deletePropery(operand, @name)
    return createCallExpression(
        createMemberExpression(TRACEUR_RUNTIME, DELETE_PROPERTY),
        createArgumentList(operand, atNameExpression));
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  static transformTree(identifierGenerator, tree) {
    return new AtNameMemberTransformer(identifierGenerator).transformAny(tree);
  }
}

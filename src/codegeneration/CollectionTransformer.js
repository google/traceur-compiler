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

import {
  ELEMENT_DELETE,
  ELEMENT_GET,
  ELEMENT_HAS,
  ELEMENT_SET,
  TRACEUR_RUNTIME
} from '../syntax/PredefinedName';
import {MEMBER_LOOKUP_EXPRESSION} from '../syntax/trees/ParseTreeType';
import {TempVarTransformer} from './TempVarTransformer';
import {
  DELETE,
  EQUAL,
  IN
} from '../syntax/TokenType';
import {
  createArgumentList,
  createAssignmentExpression,
  createCallCall,
  createCallExpression,
  createCommaExpression,
  createIdentifierExpression,
  createMemberExpression,
  createParenExpression
} from './ParseTreeFactory';
import {expandMemberLookupExpression} from './OperatorExpander';

/**
 * Transforms expr[expr] into traceurRuntime.elementGet(expr, expr). It also
 * transforms []=, delete and the in operator in similar fashion.
 *
 * This pass is used for private names as well as for the reformed object
 * model.
 *
 * http://wiki.ecmascript.org/doku.php?id=harmony:private_name_objects
 * http://wiki.ecmascript.org/doku.php?id=strawman:object_model_reformation
 *
 * The reformed object model allows user defined traps for [], []= and delete.
 * For example:
 *
 *   module Name from '@name';
 *   var storage = Object.create(null);
 *   var object = {};
 *   object[Name.elementGet] = function(key) {
 *     return storage[hashCode(key)];
 *   };
 *   object[Name.elementSet] = function(key, value) {
 *     storage[hashCode(key)] = value;
 *   };
 *   var key = {};
 *   object[key] = 42;
 */
export class CollectionTransformer extends TempVarTransformer {

  transformBinaryOperator(tree) {
    if (tree.operator.type === IN) {
      var name = this.transformAny(tree.left);
      var object = this.transformAny(tree.right);
      // name in object
      // =>
      // traceurRuntime.elementHas(object, name)
      return createCallExpression(
          createMemberExpression(TRACEUR_RUNTIME, ELEMENT_HAS),
          createArgumentList(object, name));
    }

    if (tree.left.type === MEMBER_LOOKUP_EXPRESSION &&
        tree.operator.isAssignmentOperator()) {

      if (tree.operator.type !== EQUAL) {
        tree = expandMemberLookupExpression(tree, this);
        return this.transformAny(tree);
      }

      var operand = this.transformAny(tree.left.operand);
      var memberExpression = this.transformAny(tree.left.memberExpression);
      var value = this.transformAny(tree.right);

      // operand[memberExpr] = value
      // =>
      // traceurRuntime.elementSet(operand, memberExpr, value)
      return createCallExpression(
          createMemberExpression(TRACEUR_RUNTIME, ELEMENT_SET),
          createArgumentList(operand, memberExpression, value));
    }

    return super.transformBinaryOperator(tree);
  }

  transformCallExpression(tree) {
    if (tree.operand.type !== MEMBER_LOOKUP_EXPRESSION)
      return super.transformCallExpression(tree);

    var operand = this.transformAny(tree.operand.operand);
    var memberExpression = this.transformAny(tree.operand.memberExpression);

    // operand[memberExpr](args)
    // =>
    // ($tmp = operand,
    //  traceurRuntime.elementGet($tmp, memberExpr).call($tmp, args))

    var ident = createIdentifierExpression(this.addTempVar());
    var elements = tree.args.args.map(this.transformAny, this);
    var callExpr = createCallCall(
        createCallExpression(
          createMemberExpression(TRACEUR_RUNTIME, ELEMENT_GET),
          createArgumentList(ident, memberExpression)),
        ident,
        elements);

    var expressions = [
      createAssignmentExpression(ident, operand),
      callExpr
    ];

    return createParenExpression(createCommaExpression(expressions));
  }

  transformMemberLookupExpression(tree) {
    // operand[memberExpr]
    // =>
    // traceurRuntime.elementGet(operand, memberExpr)
    return createCallExpression(
        createMemberExpression(TRACEUR_RUNTIME, ELEMENT_GET),
        createArgumentList(tree.operand, tree.memberExpression));
  }

  transformUnaryExpression(tree) {
    if (tree.operator.type !== DELETE ||
        tree.operand.type !== MEMBER_LOOKUP_EXPRESSION) {
      return super.transformUnaryExpression(tree);
    }

    var operand = this.transformAny(tree.operand.operand);
    var memberExpression = this.transformAny(tree.operand.memberExpression);

    // delete operand[memberExpr]
    // =>
    // traceurRuntime.elementDelete(operand, memberExpr)
    return createCallExpression(
        createMemberExpression(TRACEUR_RUNTIME, ELEMENT_DELETE),
        createArgumentList(operand, memberExpression));
  }

  /**
   * @param {UniqueIdentifierGenerator} identifierGenerator
   * @param {ParseTree} tree
   * @return {ParseTree}
   */
  static transformTree(identifierGenerator, tree) {
    return new CollectionTransformer(identifierGenerator).transformAny(tree);
  }
}

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

import {ExplodeExpressionTransformer} from './ExplodeExpressionTransformer.js';
import {
  FunctionDeclaration,
  FunctionExpression
} from '../syntax/trees/ParseTrees.js';
import {
  MEMBER_EXPRESSION,
  MEMBER_LOOKUP_EXPRESSION,
  SUPER_EXPRESSION
} from '../syntax/trees/ParseTreeType.js';
import {ParseTreeTransformer} from './ParseTreeTransformer.js';
import {
  EQUAL,
  MINUS_MINUS,
  PLUS_PLUS
} from '../syntax/TokenType.js';
import {
  createArgumentList,
  createIdentifierExpression,
  createParenExpression,
  createStringLiteral,
  createThisExpression
} from './ParseTreeFactory.js';
import {parseExpression} from './PlaceholderParser.js';

class ExplodeSuperExpression extends ExplodeExpressionTransformer {
  transformArrowFunctionExpression(tree) {
    return tree;
  }
  transformClassExpression(tree) {
    return tree;
  }
  transformFunctionBody(tree) {
    return tree;
  }
}

/**
 * Transforms super expressions in function bodies.
 *
 *   super.x  =>  superGet(this, proto, 'x')
 *   super.x = expr  =>  superSet(this, proto, 'x', expr)
 *   super.x(1, 2)  =>  superGet(this, proto, 'x').call(this, 1, 2)
 *
 * This also transforms super.x++, ++super.x and super.x += expr
 * into forms that use the runtime functions.
 */
export class SuperTransformer extends ParseTreeTransformer {
  /**
   * @param {TempVarTransformer} tempVarTransformer
   * @param {ParseTree} protoName
   * @param {string} thisName The name of the saved 'this' var
   * @param {ParseTree} internalName The name of the save class binding.
   */
  constructor(tempVarTransformer, protoName, thisName, internalName) {
    super();
    this.tempVarTransformer_ = tempVarTransformer;
    this.protoName_ = protoName;
    this.internalName_ = internalName;
    this.superCount_ = 0;
    this.thisVar_ = createIdentifierExpression(thisName);
    this.inNestedFunc_ = 0;
    this.nestedSuperCount_ = 0;
  }

  get hasSuper() {
    return this.superCount_ > 0;
  }

  get nestedSuper() {
    return this.nestedSuperCount_ > 0;
  }

  transformFunctionDeclaration(tree) {
    return this.transformFunction_(tree, FunctionDeclaration);
  }

  transformFunctionExpression(tree) {
    return this.transformFunction_(tree, FunctionExpression);
  }

  transformFunction_(tree, constructor) {
    let oldSuperCount = this.superCount_;

    this.inNestedFunc_++;
    let transformedTree = constructor === FunctionExpression ?
        super.transformFunctionExpression(tree) :
        super.transformFunctionDeclaration(tree);
    this.inNestedFunc_--;

    if (oldSuperCount !== this.superCount_)
      this.nestedSuperCount_ += this.superCount_ - oldSuperCount;

    return transformedTree;
  }

  // We should never get to these if ClassTransformer is doing its job.
  transformGetAccessor(tree) { return tree; }
  transformSetAccessor(tree) { return tree; }
  transformPropertyMethodAssignment(tree) { return tree; }

  /**
   * @param {CallExpression} tree
   * @return {ParseTree}
   */
  transformCallExpression(tree) {
    // TODO(arv): This does not yet handle computed properties.
    // [expr]() { super(); }
    if (tree.operand.type === SUPER_EXPRESSION) {
      // We have: super(args)
      this.superCount_++;
      return this.createSuperCall_(tree);
    }

    if (hasSuperMemberExpression(tree.operand)) {
      // super.member(args) or super[expr](args)
      this.superCount_++;

      let name;
      if (tree.operand.type === MEMBER_EXPRESSION)
        name = tree.operand.memberName.value;
      else
        name = tree.operand.memberExpression;

      return this.createSuperCallMethod_(name, tree);
    }

    return super.transformCallExpression(tree);
  }

  createSuperCall_(tree) {
    let thisExpr = this.inNestedFunc_ ? this.thisVar_ : createThisExpression();
    let args = createArgumentList([thisExpr, ...tree.args.args]);
    return parseExpression
        `$traceurRuntime.superConstructor(${this.internalName_}).call(${args})`;
  }

  /**
   * @param {string|LiteralExpression} methodName
   * @param {CallExpression} tree
   * @return {CallExpression}
   */
  createSuperCallMethod_(methodName, tree) {
    let thisExpr = this.inNestedFunc_ ? this.thisVar_ : createThisExpression();
    let operand = this.transformMemberShared_(methodName);
    let args = createArgumentList([thisExpr, ...tree.args.args]);
    return parseExpression `${operand}.call(${args})`;
  }

  transformMemberShared_(name) {
    let thisExpr = this.inNestedFunc_ ? this.thisVar_ : createThisExpression();
    return parseExpression
        `$traceurRuntime.superGet(${thisExpr}, ${this.protoName_}, ${name})`;
  }

  /**
   * @param {MemberExpression} tree
   * @return {ParseTree}
   */
  transformMemberExpression(tree) {
    if (tree.operand.type === SUPER_EXPRESSION) {
      this.superCount_++;
      return this.transformMemberShared_(tree.memberName.value);
    }
    return super.transformMemberExpression(tree);
  }

  transformMemberLookupExpression(tree) {
    if (tree.operand.type === SUPER_EXPRESSION)
      return this.transformMemberShared_(tree.memberExpression);
    return super.transformMemberLookupExpression(tree);
  }

  transformBinaryExpression(tree) {
    if (tree.operator.isAssignmentOperator() &&
        hasSuperMemberExpression(tree.left)) {
      if (tree.operator.type !== EQUAL) {
        let exploded = new ExplodeSuperExpression(this.tempVarTransformer_).
            transformAny(tree);
        return this.transformAny(createParenExpression(exploded));
      }

      this.superCount_++;
      let name = tree.left.type === MEMBER_LOOKUP_EXPRESSION ?
          tree.left.memberExpression :
          createStringLiteral(tree.left.memberName.value);

      let thisExpr = this.inNestedFunc_ ?
          this.thisVar_ : createThisExpression();
      let right = this.transformAny(tree.right);
      return parseExpression
          `$traceurRuntime.superSet(${thisExpr}, ${this.protoName_}, ${name},
                                    ${right})`;
    }

    return super.transformBinaryExpression(tree);
  }

  transformUnaryExpression(tree) {
    let transformed = this.transformIncrementDecrement_(tree);
    if (transformed)
      return transformed;
    return super.transformUnaryExpression(tree);
  }

  transformPostfixExpression(tree) {
    let transformed = this.transformIncrementDecrement_(tree);
    if (transformed)
      return transformed;
    return super.transformPostfixExpression(tree);
  }

  transformIncrementDecrement_(tree) {
    let operator = tree.operator;
    let operand = tree.operand;
    if ((operator.type === PLUS_PLUS || operator.type === MINUS_MINUS) &&
        hasSuperMemberExpression(operand)) {
      let exploded = new ExplodeSuperExpression(this.tempVarTransformer_).
          transformAny(tree);
      if (exploded !== tree)
        exploded = createParenExpression(exploded);
      return this.transformAny(exploded);
    }

    return null;
  }
}

function hasSuperMemberExpression(tree) {
  if (tree.type !== MEMBER_EXPRESSION && tree.type !== MEMBER_LOOKUP_EXPRESSION)
    return false;
  return tree.operand.type === SUPER_EXPRESSION;
}

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

import {ExplodeExpressionTransformer} from './ExplodeExpressionTransformer';
import {
  FunctionDeclaration,
  FunctionExpression
} from '../syntax/trees/ParseTrees';
import {
  LITERAL_PROPERTY_NAME,
  MEMBER_EXPRESSION,
  MEMBER_LOOKUP_EXPRESSION,
  SUPER_EXPRESSION
} from '../syntax/trees/ParseTreeType';
import {ParseTreeTransformer} from './ParseTreeTransformer';
import {
  EQUAL,
  MINUS_MINUS,
  PLUS_PLUS
} from '../syntax/TokenType';
import {assert} from '../util/assert';
import {
  createArrayLiteralExpression,
  createIdentifierExpression,
  createParenExpression,
  createStringLiteral,
  createThisExpression
} from './ParseTreeFactory';
import {parseExpression} from './PlaceholderParser';

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
 *   super.x()  =>  superCall(this, proto, 'x', args)
 *
 * This also transforms super.x++, ++super.x and super.x += expr
 * into forms that use the runtime functions.
 */
export class SuperTransformer extends ParseTreeTransformer {
  /**
   * @param {TempVarTransformer} tempVarTransformer
   * @param {ParseTree} protoName
   * @param {ParseTree} methodTree
   * @param {string} thisName The name of the saved 'this' var
   */
  constructor(tempVarTransformer, protoName, methodTree, thisName) {
    this.tempVarTransformer_ = tempVarTransformer;
    this.protoName_ = protoName;
    this.method_ = methodTree;
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
    var oldSuperCount = this.superCount_;

    this.inNestedFunc_++;
    var transformedTree = constructor === FunctionExpression ?
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
  transformPropertyMethodAssignMent(tree) { return tree; }

  /**
   * @param {CallExpression} tree
   * @return {ParseTree}
   */
  transformCallExpression(tree) {
    // TODO(arv): This does not yet handle computed properties.
    // [expr]() { super(); }

    if (this.method_ && tree.operand.type == SUPER_EXPRESSION) {
      // We have: super(args)
      this.superCount_++;
      assert(this.method_.name.type === LITERAL_PROPERTY_NAME);
      var methodName = this.method_.name.literalToken.value;
      return this.createSuperCallExpression_(methodName, tree);
    }

    if (hasSuperMemberExpression(tree.operand)) {
      // super.member(args) or super[expr](args)
      this.superCount_++;

      var name;
      if (tree.operand.type == MEMBER_EXPRESSION)
        name = tree.operand.memberName.value;
      else
        name = tree.operand.memberExpression;

      return this.createSuperCallExpression_(name, tree);
    }

    return super.transformCallExpression(tree);
  }

  /**
   * @param {string|LiteralExpression} methodName
   * @param {CallExpression} tree
   * @return {CallExpression}
   */
  createSuperCallExpression_(methodName, tree) {
    var thisExpr = this.inNestedFunc_ ? this.thisVar_ : createThisExpression();
    var args = createArrayLiteralExpression(tree.args.args);
    return this.createSuperCallExpression(thisExpr, this.protoName_,
                                          methodName, args);
  }

  /**
   * @param {ParseTree} thisExpr
   * @param {ParseTree} protoName
   * @param {string|LiteralExpression} methodName
   * @param {ParseTree} args
   * @return {CallExpression}
   */
  createSuperCallExpression(thisExpr, protoName, methodName, args) {
    return parseExpression
        `$traceurRuntime.superCall(${thisExpr}, ${protoName}, ${methodName},
                                   ${args})`;
  }

  transformMemberShared_(tree, name) {
    var thisExpr = this.inNestedFunc_ ? this.thisVar_ : createThisExpression();
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
      return this.transformMemberShared_(tree,
          createStringLiteral(tree.memberName.value));
    }
    return super.transformMemberExpression(tree);
  }

  transformMemberLookupExpression(tree) {
    if (tree.operand.type === SUPER_EXPRESSION)
      return this.transformMemberShared_(tree, tree.memberExpression);
    return super.transformMemberLookupExpression(tree);
  }

  transformBinaryOperator(tree) {
    if (tree.operator.isAssignmentOperator() &&
        hasSuperMemberExpression(tree.left)) {
      if (tree.operator.type !== EQUAL) {
        var exploded = new ExplodeSuperExpression(this.tempVarTransformer_).
            transformAny(tree);
        return this.transformAny(createParenExpression(exploded));
      }

      this.superCount_++;
      var name = tree.left.type === MEMBER_LOOKUP_EXPRESSION ?
          tree.left.memberExpression :
          createStringLiteral(tree.left.memberName.value);

      var thisExpr = this.inNestedFunc_ ?
          this.thisVar_ : createThisExpression();
      var right = this.transformAny(tree.right);
      return parseExpression
          `$traceurRuntime.superSet(${thisExpr}, ${this.protoName_}, ${name},
                                    ${right})`;
    }

    return super.transformBinaryOperator(tree);
  }

  transformUnaryExpression(tree) {
    var transformed = this.transformIncrementDecrement_(tree);
    if (transformed)
      return transformed;
    return super(tree);
  }

  transformPostfixExpression(tree) {
    var transformed = this.transformIncrementDecrement_(tree);
    if (transformed)
      return transformed;
    return super(tree);
  }

  transformIncrementDecrement_(tree) {
    var operator = tree.operator;
    var operand = tree.operand;
    if ((operator.type === PLUS_PLUS || operator.type === MINUS_MINUS) &&
        hasSuperMemberExpression(operand)) {
      var exploded = new ExplodeSuperExpression(this.tempVarTransformer_).
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

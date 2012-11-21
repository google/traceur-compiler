// Copyright 2012 Google Inc.
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
  MEMBER_EXPRESSION,
  MEMBER_LOOKUP_EXPRESSION,
  SUPER_EXPRESSION
} from '../syntax/trees/ParseTreeType.js';
import ParseTreeTransformer from 'ParseTreeTransformer.js';
import {
  RUNTIME,
  SUPER_CALL,
  SUPER_GET,
  SUPER_SET,
  TRACEUR
} from '../syntax/PredefinedName.js';
import TokenType from '../syntax/TokenType.js';
import {
  createArgumentList,
  createArrayLiteralExpression,
  createCallExpression,
  createIdentifierExpression,
  createMemberExpression,
  createStringLiteral,
  createThisExpression
} from 'ParseTreeFactory.js';
import {
  expandMemberExpression,
  expandMemberLookupExpression
} from 'OperatorExpander.js';

/**
 * Transforms super expressions in function bodies.
 */
export class SuperTransformer extends ParseTreeTransformer {
  /**
   * @param {TempVarTransformer} tempVarTransformer
   * @param {ErrorReporter} reporter
   * @param {ParseTree} className
   * @param {ParseTree} methodTree
   * @param {string} thisName The name of the saved 'this' var
   */
  constructor(tempVarTransformer, reporter, className, methodTree, thisName) {
    super();
    this.tempVarTransformer_ = tempVarTransformer;
    this.className_ = className;
    this.method_ = methodTree;
    this.reporter_ = reporter;
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

  transformFunction(tree) {
    var oldSuperCount = this.superCount_;

    this.inNestedFunc_++;
    var transformedTree = super.transformFunction(tree);
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
    if (this.method_ && tree.operand.type == SUPER_EXPRESSION) {
      // We have: super(args)
      this.superCount_++;
      var methodName = this.method_.name.value;

      // traceur.runtime.superCall(this, class, "name", <args>)
      return createCallExpression(
          createMemberExpression(
              TRACEUR,
              RUNTIME,
              SUPER_CALL),
          createArgumentList(
            this.inNestedFunc_ ? this.thisVar_ : createThisExpression(),
            this.className_,
            createStringLiteral(methodName),
            createArrayLiteralExpression(tree.args.args)));
    }

    if ((tree.operand.type == MEMBER_EXPRESSION ||
         tree.operand.type == MEMBER_LOOKUP_EXPRESSION) &&
        tree.operand.operand.type == SUPER_EXPRESSION) {
      // super.member(args) or member[exrp](args)
      this.superCount_++;

      var nameExpression;
      if (tree.operand.type == MEMBER_EXPRESSION) {
        nameExpression = createStringLiteral(
            tree.operand.memberName.value);
      } else {
        nameExpression = tree.operand.memberExpression;
      }

      // traceur.runtime.superCall(this, class, "name", <args>)
      return createCallExpression(
          createMemberExpression(
              TRACEUR, RUNTIME, SUPER_CALL),
          createArgumentList(
            this.inNestedFunc_ ? this.thisVar_ : createThisExpression(),
            this.className_,
            nameExpression,
            createArrayLiteralExpression(tree.args.args)));
    }

    return super.transformCallExpression(tree);
  }

  transformMemberShared_(tree, name) {
    // traceur.runtime.superGet(this, class, "name")
    return createCallExpression(
        createMemberExpression(TRACEUR, RUNTIME, SUPER_GET),
        createArgumentList(
          this.inNestedFunc_ ? this.thisVar_ : createThisExpression(),
          this.className_,
          name));
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
        (tree.left.type === MEMBER_EXPRESSION ||
         tree.left.type === MEMBER_LOOKUP_EXPRESSION) &&
        tree.left.operand.type === SUPER_EXPRESSION) {

      if (tree.operator.type !== TokenType.EQUAL) {
        if (tree.left.type === MEMBER_LOOKUP_EXPRESSION) {
          tree = expandMemberLookupExpression(tree,
                                                 this.tempVarTransformer_);
        } else {
          tree = expandMemberExpression(tree, this.tempVarTransformer_);
        }
        return this.transformAny(tree);
      }

      this.superCount_++;
      var name = tree.left.type === MEMBER_LOOKUP_EXPRESSION ?
          tree.left.memberExpression :
          createStringLiteral(tree.left.memberName.value);

      // traceur.runtim.superSet(this, class, "name", value)
      return createCallExpression(
          createMemberExpression(TRACEUR, RUNTIME, SUPER_SET),
          createArgumentList(
            this.inNestedFunc_ ? this.thisVar_ : createThisExpression(),
            this.className_,
            name,
            this.transformAny(tree.right)));
    }

    return super.transformBinaryOperator(tree);
  }

  /**
   * @param {SuperExpression} tree
   * @return {ParseTree}
   */
  transformSuperExpression(tree) {
    this.reportError_(tree, '"super" may only be used on the LHS of a member '+
                            'access expression before a call (TODO wording)');
    return tree;
  }

  reportError_(tree, ...args) {
    this.reporter_.reportError(tree.location.start, ...args);
  }
}

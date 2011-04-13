// Copyright 2011 Google Inc.
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

traceur.define('codegeneration', function() {
  'use strict';

  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;
  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var BoundIdentifierAccumulator = traceur.semantics.BoundIdentifierAccumulator;
  var boundIdentifiersInFunction = BoundIdentifierAccumulator.boundIdentifiersInFunction;
  var boundIdentifiersInBlock = BoundIdentifierAccumulator.boundIdentifiersInBlock;
  var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
  var PredefinedName = traceur.syntax.PredefinedName;
  var BlockTree = traceur.syntax.trees.BlockTree;
  var CatchTree = traceur.syntax.trees.CatchTree;
  var FunctionDeclarationTree = traceur.syntax.trees.FunctionDeclarationTree;
  var IdentifierExpressionTree = traceur.syntax.trees.IdentifierExpressionTree;
  var ParseTree = traceur.syntax.trees.ParseTree;

  /**
   * Replaces one identifier with another identifier (alpha
   * renaming). This transformation is safe to use for renaming a
   * declared variable ({@code var}, {@code const} or {@code let}) or
   * formal parameter, if the variable's scope isn't dynamically limited
   * using the {@code with} statement, nor its name observed with
   * {@code eval} or in a property binding, and so on.
   *
   * Creates an {@code AlphaRenamer} that will replace uses of the
   * identifier {@code oldName} with {@code newName}.
   *
   * @param {string} oldName
   * @param {string} newName
   * @extends {ParseTreeTransformer}
   * @constructor
   */
  function AlphaRenamer(oldName, newName) {
    ParseTreeTransformer.call(this);
    this.oldName_ = oldName;
    this.newName_ = newName;
    Object.freeze(this);
  }

  /**
   * Alpha-renames {@code oldName} to {@code newName} in {@code tree}
   * and returns the new {@code ParseTree}.
   *
   * <p>Renaming is applied throughout the lexical scope of the
   * variable. If the old name is freshly bound alpha-renaming doesn't
   * propagate there; for example, renaming {@code "a"} to {@code "b"}
   * in the following program:
   *
   * <pre>
   * function a(a) {
   *   ...
   * }
   * </pre>
   * Will produce:
   * <pre>
   * function b(a) {
   *   ...
   * }
   * </pre>
   *
   * @param {ParseTree} tree the tree to substitute names in.
   * @param {string} oldName the identifier to be replaced.
   * @param {string} newName the identifier that will appear instead of {@code oldName}.
   * @return {ParseTree} a copy of {@code tree} with replacements.
   */
  AlphaRenamer.rename = function(tree, oldName, newName) {
    return new AlphaRenamer(oldName, newName).transformAny(tree);
  };

  var proto = ParseTreeTransformer.prototype;
  AlphaRenamer.prototype = {
    __proto__: proto,

    /**
     * @param {BlockTree} tree
     * @return {ParseTree}
     */
    transformBlockTree: function(tree) {
      if (this.oldName_ in boundIdentifiersInBlock(tree)) {
        // the old name is bound in the block, skip rename
        return tree;
      } else {
        return proto.transformBlockTree.call(this, tree);
      }
    },

    /**
     * @param {IdentifierExpressionTree} tree
     * @return {ParseTree}
     */
    transformIdentifierExpressionTree: function(tree) {
      if (this.oldName_ == tree.identifierToken.value) {
        return createIdentifierExpression(this.newName_);
      } else {
        return tree;
      }
    },

    /**
     * @param {FunctionDeclarationTree} tree
     * @return {ParseTree}
     */
    transformFunctionDeclarationTree: function(tree) {
      if (this.oldName_ == tree.name) {
        // it is the function that is being renamed
        tree = createFunctionDeclaration(this.newName_,
            tree.formalParameterList, tree.functionBody);
      }

      if (// this.oldName_ is rebound in the new nested scope, so don't recurse
          this.oldName_ in boundIdentifiersInFunction(tree) ||
          // 'arguments' is implicitly bound in function bodies; don't recurse
          PredefinedName.ARGUMENTS == this.oldName_) {
        return tree;
      } else {
        return proto.transformFunctionDeclarationTree.call(this, tree);
      }
    },

    /**
     * @param {CatchTree} tree
     * @return {ParseTree}
     */
    transformCatchTree: function(tree) {
      if (this.oldName_ == tree.exceptionName.value) {
        // this.oldName_ is rebound in the catch block, so don't recurse
        return tree;
      } else {
        return proto.transformCatchTree.call(this, tree);
      }
    }
  };

  return {
    AlphaRenamer: AlphaRenamer
  };
});

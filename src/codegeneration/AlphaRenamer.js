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
  FunctionDeclaration,
  FunctionExpression
} from '../syntax/trees/ParseTrees';
import {ParseTreeTransformer} from './ParseTreeTransformer';
import {
  ARGUMENTS,
  THIS
} from '../syntax/PredefinedName';
import {
  createIdentifierExpression
} from './ParseTreeFactory';
import {
  variablesInBlock,
  variablesInFunction
} from '../semantics/VariableBinder';

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
 */
export class AlphaRenamer extends ParseTreeTransformer {
  /**
   * @param {string} oldName
   * @param {string} newName
   */
  constructor(oldName, newName) {
    super();
    this.oldName_ = oldName;
    this.newName_ = newName;
  }

  /**
   * @param {Block} tree
   * @return {ParseTree}
   */
  transformBlock(tree) {
    if (this.oldName_ in variablesInBlock(tree)) {
      // the old name is bound in the block, skip rename
      return tree;
    } else {
      return super.transformBlock(tree);
    }
  }

  /**
   * @param {IdentifierExpression} tree
   * @return {ParseTree}
   */
  transformIdentifierExpression(tree) {
    if (this.oldName_ == tree.identifierToken.value) {
      return createIdentifierExpression(this.newName_);
    } else {
      return tree;
    }
  }

  transformThisExpression(tree) {
    if (this.oldName_ !== THIS)
      return tree;
    return createIdentifierExpression(this.newName_);
  }

  /**
   * @param {FunctionDeclaration} tree
   * @return {ParseTree}
   */
  transformFunctionDeclaration(tree) {
    if (this.oldName_ === tree.name) {
      // it is the function that is being renamed
      tree = new FunctionDeclaration(tree.location, this.newName_,
          tree.isGenerator, tree.formalParameterList, tree.typeAnnotation,
          tree.annotations, tree.functionBody);
    }

    if (this.getDoNotRecurse(tree))
      return tree;
    return super.transformFunctionDeclaration(tree);
  }

  /**
   * @param {FunctionExpression} tree
   * @return {ParseTree}
   */
  transformFunctionExpression(tree) {
    if (this.oldName_ === tree.name) {
      // it is the function that is being renamed
      tree = new FunctionExpression(tree.location, this.newName_,
          tree.isGenerator, tree.formalParameterList, tree.typeAnnotation,
          tree.annotations, tree.functionBody);
    }

    if (this.getDoNotRecurse(tree))
      return tree;
    return super.transformFunctionExpression(tree);
  }

  // Do not recurse into functions if:
  //  - 'arguments' is implicitly bound in function bodies
  //  - 'this' is implicitly bound in function bodies
  //  - this.oldName_ is rebound in the new nested scope
  getDoNotRecurse(tree) {
    return this.oldName_ === ARGUMENTS ||
        this.oldName_ === THIS ||
        this.oldName_ in variablesInFunction(tree);
  }

  /**
   * @param {Catch} tree
   * @return {ParseTree}
   */
  transformCatch(tree) {
    if (!tree.binding.isPattern() &&
        this.oldName_ === tree.binding.identifierToken.value) {
      // this.oldName_ is rebound in the catch block, so don't recurse
      return tree;
    }

    // TODO(arv): Compare the old name to the bindings in the pattern.
    return super.transformCatch(tree);
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
   * @param {string} newName the identifier that will appear instead of |oldName|.
   * @return {ParseTree} a copy of {@code tree} with replacements.
   */
  static rename(tree, oldName, newName) {
    return new AlphaRenamer(oldName, newName).transformAny(tree);
  }
}


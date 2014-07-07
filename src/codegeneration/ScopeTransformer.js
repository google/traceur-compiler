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

import {ParseTreeTransformer} from './ParseTreeTransformer';
import {
  ARGUMENTS,
  THIS
} from '../syntax/PredefinedName';
import {
  variablesInBlock,
  variablesInFunction
} from '../semantics/VariableBinder';

/**
 * A BaseClass for creating scope visitor-based operations
 * Used as the base for AlphaRenamer
 * This only works if the variable's scope isn't dynamically limited
 * using the {@code with} statement, nor its name observed with
 * {@code eval} or in a property binding, and so on.
 */
export class ScopeTransformer extends ParseTreeTransformer {
  /**
   * @param {string} varName
   */
  constructor(varName) {
    super();
    this.varName_ = varName;
  }

  /**
   * @param {Block} tree
   * @return {ParseTree}
   */
  transformBlock(tree) {
    if (this.varName_ in variablesInBlock(tree)) {
      // the var name is bound in the block, skip rename
      return tree;
    } else {
      return super.transformBlock(tree);
    }
  }

  transformThisExpression(tree) {
    if (this.varName_ !== THIS)
      return tree;
    return super.transformThisExpression(tree);
  }

  /**
   * @param {FunctionDeclaration} tree
   * @return {ParseTree}
   */
  transformFunctionDeclaration(tree) {
    if (this.getDoNotRecurse(tree))
      return tree;
    return super.transformFunctionDeclaration(tree);
  }

  /**
   * @param {FunctionExpression} tree
   * @return {ParseTree}
   */
  transformFunctionExpression(tree) {
    if (this.getDoNotRecurse(tree))
      return tree;
    return super.transformFunctionExpression(tree);
  }

  // Do not recurse into functions if:
  //  - 'arguments' is implicitly bound in function bodies
  //  - 'this' is implicitly bound in function bodies
  //  - this.varName_ is rebound in the new nested scope
  getDoNotRecurse(tree) {
    return this.varName_ === ARGUMENTS ||
        this.varName_ === THIS ||
        this.varName_ in variablesInFunction(tree);
  }

  /**
   * @param {Catch} tree
   * @return {ParseTree}
   */
  transformCatch(tree) {
    if (!tree.binding.isPattern() &&
        this.varName_ === tree.binding.identifierToken.value) {
      // this.varName_ is rebound in the catch block, so don't recurse
      return tree;
    }

    // TODO(arv): Compare the var name to the bindings in the pattern.
    return super.transformCatch(tree);
  }
}


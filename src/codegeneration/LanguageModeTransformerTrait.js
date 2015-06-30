// Copyright 2015 Traceur Authors.
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

'use strong';

import {FUNCTION_BODY} from '../syntax/trees/ParseTreeType.js';
import {
  SLOPPY_MODE,
  STRONG_MODE,
  findLanguageMode
} from '../staticsemantics/LanguageMode.js';

/**
 * This function is used as trait to generate a class that that keeps track of
 * the language mode.
 *
 * Usage:
 *
 *  class MyTransformer extends
 *      LanguageModeTransformerTrait(ParseTreeTransformer) {
 *    ...
 *  }
 *
 * @param {Function} ParseTreeTransformerClass A class that extends
 *     ParseTreeTransformer.
 * @return {Function}
 */
export function LanguageModeTransformerTrait(ParseTreeTransformerClass) {
  return class extends ParseTreeTransformerClass {
    constructor(idGen, reporter, options) {
      super(idGen, reporter, options);
      this.languageMode_ = SLOPPY_MODE;
    }

    get languageMode() {
      return this.languageMode_;
    }

    isSloppyMode() {
      return this.languageMode_ === SLOPPY_MODE;
    }

    isStrongMode() {
      return this.languageMode_ === STRONG_MODE;
    }

    isStrictMode() {
      return this.languageMode_ !== SLOPPY_MODE;
    }

    transformAndUpdateLanguageMode_(statements, transformFunction) {
      let oldLanguageMode = this.languageMode_;
      this.languageMode_ = findLanguageMode(statements, oldLanguageMode);
      let transformed = transformFunction();
      this.languageMode_ = oldLanguageMode;
      return transformed;
    }

    transformScript(tree) {
      return this.transformAndUpdateLanguageMode_(
          tree.scriptItemList,
          () => super.transformScript(tree));
    }

    transformModule(tree) {
      return this.transformAndUpdateLanguageMode_(
          tree.scriptItemList,
          () => super.transformModule(tree));
    }

    transformFunctionDeclaration(tree) {
      return this.transformAndUpdateLanguageMode_(
          tree.body.statements,
          () => super.transformFunctionDeclaration(tree));
    }

    transformFunctionExpression(tree) {
      return this.transformAndUpdateLanguageMode_(
          tree.body.statements,
          () => super.transformFunctionExpression(tree));
    }

    transformMethod(tree) {
      return this.transformAndUpdateLanguageMode_(
          tree.body.statements,
          () => super.transformMethod(tree));
    }

    transformArrowFunction(tree) {
      if (tree.body.type === FUNCTION_BODY) {
        return this.transformAndUpdateLanguageMode_(
            tree.body.statements,
            () => super.transformArrowFunction(tree));
      }
      return super.transformArrowFunction(tree);
    }

    transformGetAccessor(tree) {
      return this.transformAndUpdateLanguageMode_(
          tree.body.statements,
          () => super.transformGetAccessor(tree));
    }

    transformSetAccessor(tree) {
      return this.transformAndUpdateLanguageMode_(
          tree.body.statements,
          () => super.transformSetAccessor(tree));
    }
  }
}

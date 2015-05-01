// Copyright 2015 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {isStrictKeyword} from '../syntax/Keywords.js';
import {ParseTreeVisitor} from '../syntax/ParseTreeVisitor.js';
import {SLOPPY_MODE, STRONG_MODE} from './LanguageMode.js';
import {StringSet} from '../util/StringSet.js';
import {ARGUMENTS, EVAL, UNDEFINED} from '../syntax/PredefinedName.js';

/**
 * This visitor is used to find strict keywords (and eval/arguments) for
 * strict function formal parameters as well as finding duplicate bindings in
 * formal paramater list for strict functions and sloppy function with non
 * simple formal parameters.
 *
 * In the case of non strict params we keep track of the duplicate names in case
 * we see a default, rest or destructuring later in the list.
 */
class ParameterValidationVisitor extends ParseTreeVisitor {
  /**
   * @param {boolean} languageMode
   * @param {ErrorReporter} reporter
   */
  constructor(languageMode, reporter) {
    super();
    this.reporter_ = reporter;
    this.names_ = new StringSet();
    this.errors_ = [];
    this.reportStrictKeywords_ = languageMode !== SLOPPY_MODE;
    // In the case of sloppy functions this changes when we see a default,
    // rest or destructuring param.
    this.reportDuplicates_ = languageMode !== SLOPPY_MODE;
    this.reportUndefined_ = languageMode === STRONG_MODE;
  }

  visitBindingIdentifier(tree) {
    let name = tree.identifierToken.toString();
    if (this.reportStrictKeywords_ &&
        (isStrictKeyword(name) || name === EVAL || name === ARGUMENTS)) {
      this.reporter_.reportError(tree.location.start,
                                 `${name} is a reserved identifier`);
    }

    if (this.reportUndefined_ && name === UNDEFINED) {
      this.reporter_.reportError(
          tree.location.start,
          'In strong mode, binding or assigning to undefined is deprecated');
    }

    if (this.names_.has(name)) {
      this.maybeReportDuplicateError_(name, tree.location.start);
    }
    this.names_.add(name);
  }

  visitBindingElement(tree) {
    if (tree.initializer !== null) {
      this.reportEarlierErrors_();
    }
    this.visitAny(tree.binding);
    // Do not visit initializer.
  }

  visitRestParameter(tree) {
    this.reportEarlierErrors_();
    this.visitAny(tree.identifier);
    // Do not visit typeAnnotation.
  }

  visitFormalParameter(tree) {
    this.visitAny(tree.parameter);
    // Do not visit typeAnnotation or annotations.
  }

  visitArrayPattern(tree) {
    this.reportEarlierErrors_();
    super.visitArrayPattern(tree);
  }

  visitObjectPattern(tree) {
    this.reportEarlierErrors_();
    super.visitObjectPattern(tree);
  }

  reportDuplicateError_(name, pos) {
    this.reporter_.reportError(pos, `Duplicate parameter name ${name}`);
  }

  maybeReportDuplicateError_(name, pos) {
    if (this.reportDuplicates_) {
      this.reportDuplicateError_(name, pos);
    } else {
      this.errors_.push(name, pos);
    }
  }

  reportEarlierErrors_() {
    if (!this.reportDuplicates_) {
      this.reportDuplicates_ = true;
      for (let i = 0; i < this.errors_.length; i += 2) {
        let name = this.errors_[i];
        let pos = this.errors_[i + 1];
        this.reportDuplicateError_(name, pos);
      }
    }
  }
}

export default function(tree, languageMode, reporter) {
  new ParameterValidationVisitor(languageMode, reporter).visitAny(tree);
}

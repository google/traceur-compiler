// Copyright 2012 Traceur Authors.
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

import {ParseTreeVisitor} from '../../syntax/ParseTreeVisitor';
import {STRING} from '../../syntax/TokenType';
import {canonicalizeUrl} from '../../util/url';

// TODO(arv): This is closer to the ModuleVisitor but we don't care about
// modules.

/**
 * Visits a parse tree and finds all ModuleSpecifiers in it.
 *
 *   module m from "url"
 */
export class ModuleSpecifierVisitor extends ParseTreeVisitor {
  /**
   * @param {traceur.util.ErrorReporter} reporter
   */
  constructor(reporter) {
    super();
    this.moduleSpecifiers_ = Object.create(null);
  }

  get moduleSpecifiers() {
    return Object.keys(this.moduleSpecifiers_);
  }

  visitModuleSpecifier(tree) {
    this.moduleSpecifiers_[tree.token.processedValue] = true;
  }
}

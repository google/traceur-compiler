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

import {ParseTreeVisitor} from '../../syntax/ParseTreeVisitor.js';
import {canonicalizeUrl} from '../../util/url.js';
import {options} from '../../options.js';
import {STRING} from '../../syntax/TokenType.js';

// TODO(arv): This is closer to the ModuleVisitor but we don't care about
// modules.

/**
 * Visits a parse tree and finds all required URLs in it.
 *
 *   module m from "url"
 */
export class ModuleRequireVisitor extends ParseTreeVisitor {
  /**
   * @param {traceur.util.ErrorReporter} reporter
   */
  constructor(reporter) {
    super();
    this.urls_ = Object.create(null);
    this.definedUrls_ = Object.create(null);
  }

  get requireUrls() {
    return Object.keys(this.urls_);
  }

  visitModuleDefinition(tree) {
    if (options.pathModules && tree.name.type === STRING)
      this.definedUrls_[canonicalizeUrl(tree.name.processedValue)] = true;

    super.visitModuleDefinition(tree);
  }

  visitModuleRequire(tree) {
    var url = canonicalizeUrl(tree.url.processedValue);
    if (options.pathModules && this.definedUrls_[url])
      return;
    this.urls_[url] = true;
  }
}

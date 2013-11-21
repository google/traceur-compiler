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

import {ParseTreeVisitor} from '../syntax/ParseTreeVisitor';

// Object used as a sentinel. This is thrown to abort visiting the rest of the
// tree.
var foundSentinel = {};

/**
 * This is used to find something in a tree. Extend this class and override
 * the desired visit functions to find what you are looking for. When the tree
 * you are looking for is found set |this.found| to true. This will abort the
 * search of the remaining sub trees.
 */
export class FindVisitor extends ParseTreeVisitor {
  /**
   * @param {ParseTree} tree
   * @param {boolean=} keepOnGoing Whether to stop searching after the first
   *     found condition.
   */
  constructor(tree, keepOnGoing = undefined) {
    this.found_ = false;
    this.keepOnGoing_ = keepOnGoing;
    try {
      this.visitAny(tree);
    } catch (ex) {
      // This uses an exception to do early exits.
      if (ex !== foundSentinel)
        throw ex;
    }
  }

  /**
   * Whether the searched for tree was found. Setting this to true aborts the
   * search.
   * @type {boolean}
   */
  get found() {
    return this.found_;
  }

  set found(v) {
    if (v) {
      this.found_ = true;
      if (!this.keepOnGoing_)
        throw foundSentinel;
    }
  }
}
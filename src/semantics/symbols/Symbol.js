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

/**
 * A symbol is a named program element.
 *
 * Symbols are plain old data structures only. They have methods for querying
 * their contents, but symbols do not implement more sophisticated semantics
 * than simple data access.
 */
export class Symbol {
  /**
   * @param {string} type
   * @param {ParseTree} tree
   */
  constructor(type, tree) {
    this.type = type;
    this.tree = tree;
  }
}

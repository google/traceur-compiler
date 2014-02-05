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

import {toSource} from './toSource';

/**
 * Create a ParseTreeWriter configured with options, apply it to tree
 * @param {ParseTree} tree
 * @param {Object=} options:
 *     highlighted: {ParseTree} branch of tree to highlight
 *     showLineNumbers: {boolean} add comments giving input line numbers
 *     prettyPrint: {boolean}
 *     sourceMapGenerator: {SourceMapGenerator} see third-party/source-maps
 * @return source code; optional side-effect options.sourceMap set
 */
export function write(tree, options = undefined) {
  var [result, sourceMap] = toSource(tree, options);
  if (sourceMap)
    options.sourceMap = sourceMap;
  return result;
}

// TODO(arv): This should just export the static function instead.
export class TreeWriter {}
TreeWriter.write = write;

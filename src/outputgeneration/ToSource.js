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

import {ParseTreeMapWriter} from './ParseTreeMapWriter';
import {ParseTreeWriter} from './ParseTreeWriter';
import {SourceMapGenerator} from './SourceMapIntegration';

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
export function toSource(tree, options = undefined) {
  var sourceMapGenerator = options && options.sourceMapGenerator;
  if (!sourceMapGenerator && options && options.sourceMaps) {
    sourceMapGenerator = new SourceMapGenerator({
      file: options.filename,
      sourceRoot: null
    });
  }

  var writer;
  if (sourceMapGenerator)
    writer = new ParseTreeMapWriter(sourceMapGenerator, options);
  else
    writer = new ParseTreeWriter(options);

  writer.visitAny(tree);

  return [writer.toString(),
      sourceMapGenerator && sourceMapGenerator.toString()];
}


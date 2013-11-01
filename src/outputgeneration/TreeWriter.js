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

/**
 * Create a ParseTreeWriter configured with options, apply it to tree
 * @param {ParseTree} tree
 * @param {Object=} options:
 *   highlighted: {ParseTree} branch of tree to highlight
 *   showLineNumbers: {boolean} add comments giving input line numbers
 *   sourceMapGenerator: {SourceMapGenerator} see third-party/source-maps
 * @return source code; optional side-effect options.sourceMap set
 */
export function write(tree, options = undefined) {
  var showLineNumbers;
  var highlighted = null;
  var sourceMapGenerator;
  if (options) {
    showLineNumbers = options.showLineNumbers;
    highlighted = options.highlighted || null;
    sourceMapGenerator = options.sourceMapGenerator;
  }

  var writer;
  if (sourceMapGenerator) {
    writer = new ParseTreeMapWriter(highlighted, showLineNumbers,
        sourceMapGenerator);
  } else {
    writer = new ParseTreeWriter(highlighted, showLineNumbers);
  }

  writer.visitAny(tree);
  if (writer.currentLine_.length > 0) {
    writer.writeln_();
  }

  if (sourceMapGenerator) {
    options.sourceMap = sourceMapGenerator.toString();
  }

  return writer.result_.toString();
}


// TODO(arv): This should just export the static function instead.
export class TreeWriter {}
TreeWriter.write = write;

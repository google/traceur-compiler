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

import {ParseTreeWriter} from './ParseTreeWriter';

/**
 * Converts a ParseTree to text and a source Map
 */
export class ParseTreeMapWriter extends ParseTreeWriter {
  /**
   * @param {ParseTree} highlighted
   * @param {boolean} showLineNumbers
   * @param {SourceMapGenerator} sourceMapGenerator
   */
  constructor(sourceMapGenerator, options = undefined) {
    super(options);
    this.sourceMapGenerator_ = sourceMapGenerator;
    this.outputLineCount_ = 1;
  }

  visitAny(tree) {
    if (!tree) {
      return;
    }

    if (tree.location)
      this.addMapping(tree.location.start);

    super(tree);

    if (tree.location)
      this.addMapping(tree.location.end);
  }

  writeCurrentln_() {
    super.writeCurrentln_();
    this.outputLineCount_++;
  }

  addMapping(position) {
    var mapping = {
      generated: {
        line: this.outputLineCount_,
        column: this.currentLine_.length
      },
      original: {
        // +1 because line is zero based
        line: position.line + 1,
        column: position.column
       },
       source: position.source.name || '(anonymous)'
    };
    this.sourceMapGenerator_.addMapping(mapping);
    // This over-writes previous value each time.
    this.sourceMapGenerator_.setSourceContent(position.source.name, position.source.contents);
  }
}

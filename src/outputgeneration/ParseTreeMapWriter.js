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
 * Converts a ParseTree to text and a source Map.
 */
export class ParseTreeMapWriter extends ParseTreeWriter {
  /**
   * @param {SourceMapGenerator} sourceMapGenerator
   * @param {Object} options for ParseTreeWriter
   */
  constructor(sourceMapGenerator, options = undefined) {
    super(options);
    this.sourceMapGenerator_ = sourceMapGenerator;
    this.outputLineCount_ = 1;
    this.isFirstMapping_ = true;
  }

  //
  // We get control when we enter and exit an AST branch and when
  // we write tokens. eg:
  // if {
  //  stmt;
  // }
  // enter write-if write-open newline
  //   enter write-stmt exit newline
  // write-close exit newline
  // We want at least one source map record for every output line.
  // Each record covers characters from the line/col to the next record.
  // Debuggers tend to be line-oriented. Thus we want the first record on
  // each line to start at the first column so no record spans lines.

  visitAny(tree) {
    if (!tree) {
      return;
    }

    if (tree.location)
      this.enterBranch(tree.location);

    super(tree);

    if (tree.location)
      this.exitBranch(tree.location);
  }

  writeCurrentln_() {
    super.writeCurrentln_();
    this.flushMappings();
    this.outputLineCount_++;
    // Every time we write an output line, then next mapping will start
    // on column 1.
    this.generated_ = {
      line: this.outputLineCount_,
      column: 1
    };
    this.flushMappings();
  }

  write_(value) {
    if (this.entered_) {
      this.generate();
      super.write_(value);
      this.generate();
    } else {
      this.generate();
      super.write_(value);
      this.generate();
    }
  }

  generate() {
    this.generated_ = {
      line: this.outputLineCount_,
      column: this.currentLine_.length
    };
    this.flushMappings();
  }

  enterBranch(location) {
    this.originate(location.start);
    this.entered_ = true;
  }

  exitBranch(location) {
    this.originate(location.end);
    this.entered_ = false;
  }

  originate(position) {
    var line = position.line + 1;
    // Try to get a mapping for every input line.
    if (this.original_ && this.original_.line !== line)
      this.flushMappings();
    // The first mapping on each output line must cover beginning columns.
    this.original_ = {
      line: line,
      column: position.column || 0
    };
    if (position.source.name !== this.sourceName_) {
      this.sourceName_ = position.source.name;
      this.sourceMapGenerator_.setSourceContent(position.source.name,
          position.source.contents);
    }
    this.flushMappings();
  }

  flushMappings() {
    if (this.original_ && this.generated_) {
      this.addMapping();
      this.original_ = null;
      this.generated_ = null;
    }
  }

  isSame(lhs, rhs) {
    return lhs.line === rhs.line && lhs.column === rhs.column;
  }

  isSameMapping() {
    if (!this.previousMapping_)
      return false;
    if (this.isSame(this.previousMapping_.generated, this.generated_) &&
        this.isSame(this.previousMapping_.original, this.original_))
      return true;;
  }

  addMapping() {
    if (this.isSameMapping())
      return;

    var mapping = {
      generated: this.generated_,
      original: this.original_,
      source: this.sourceName_
    };
    this.sourceMapGenerator_.addMapping(mapping);
    this.previousMapping_ = mapping;
  }
}

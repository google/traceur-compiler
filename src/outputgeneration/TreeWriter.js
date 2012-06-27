// Copyright 2011 Google Inc.
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

traceur.define('outputgeneration', function() {
  'use strict';

  var ParseTreeWriter = traceur.outputgeneration.ParseTreeWriter;
  var ParseTreeMapWriter = traceur.outputgeneration.ParseTreeMapWriter;

  function TreeWriter() {}

  /*
   * Create a ParseTreeWriter configured with options, apply it to tree
   * @param {ParseTree} tree
   * @param {Object} opt_options:
   *   highlighted: {ParseTree} branch of tree to highlight
   *   showLineNumbers: {boolean} add comments giving input line numbers
   *   sourceMapGenerator: {SourceMapGenerator} see third-party/source-maps
   * @return source code; optional side-effect opt_options.sourceMap set
   */

  TreeWriter.write = function(tree, opt_options) {
    var showLineNumbers;
    var highlighted = null;
    var sourceMapGenerator;
    if (opt_options) {
      showLineNumbers = opt_options.showLineNumbers;
      highlighted = opt_options.highlighted || null;
      sourceMapGenerator = opt_options.sourceMapGenerator;
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
      opt_options.sourceMap = sourceMapGenerator.toString();
    }

    return writer.result_.toString();
  };

  return {
    TreeWriter: TreeWriter
  };
});
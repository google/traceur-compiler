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

    /**
   * Converts a ParseTree to text and a source Map
   * @param {ParseTree} highlighted
   * @param {boolean} showLineNumbers
   * @param { {SourceMapGenerator} sourceMapGenerator
   * @constructor
   */
  function ParseTreeMapWriter(highlighted, showLineNumbers,
                              sourceMapGenerator) {
    ParseTreeWriter.call(this, highlighted, showLineNumbers);
    this.sourceMapGenerator_ = sourceMapGenerator;
    this.outputLineCount = 0;
  }

  ParseTreeMapWriter.prototype = traceur.createObject(
      ParseTreeWriter.prototype, {

    write_: function(value) {
      if (this.currentLocation) {
        this.addMapping();
      }
      ParseTreeWriter.prototype.write_.apply(this,[value]);
    },

    addMapping: function() {
      var mapping = {
        generated: {
          // http://code.google.com/p/traceur-compiler/issues/detail?id=105
          // +1 because PROGRAM puts a newline before the first stmt
          line: this.outputLineCount + 1,
          column: this.currentLine_.length
        },
        original: {
          // +1 because line is zero based
          line: this.currentLocation.start.line + 1,
          column: this.currentLocation.start.column
         },
         source: this.currentLocation.start.source.name
      };
      this.sourceMapGenerator_.addMapping(mapping);
    }
  });

  return {
    ParseTreeMapWriter: ParseTreeMapWriter
  };

});
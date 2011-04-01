// Copyright 2011 Google Inc.
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

traceur.define('syntax', function() {
  'use strict';

  var SourceRange = traceur.util.SourceRange;
  var SourcePosition = traceur.util.SourcePosition;

  /**
   * Maps offsets into a source string into line/column positions.
   *
   * Immutable.
   *
   * @param {SourceFile} sourceFile
   * @constructor
   */
  function LineNumberTable(sourceFile) {
    this.sourceFile_ = sourceFile;
    this.lineStartOffsets_ = computeLineStartOffsets(sourceFile.contents);
  }

  /**
   * Taken from Closure Library
   */
  function binarySearch(arr, target) {
    var left = 0;
    var right = arr.length - 1;
    while (left <= right) {
      var mid = (left + right) >> 1;
      if (target > arr[mid]) {
        left = mid + 1;
      } else if (target < arr[mid]) {
        right = mid - 1;
      } else {
        return mid;
      }
    }
    // Not found, left is the insertion point.
    return -(left + 1);
  }

  // Largest int that can be distinguished
  // assert(n + 1 === n)
  // assert(n - 1 !== n)
  var MAX_INT_REPRESENTATION = 9007199254740992;

  function computeLineStartOffsets(source) {
    var lineStartOffsets = [];
    lineStartOffsets.push(0);
    for (var index = 0; index < source.length; index++) {
      var ch = source.charAt(index);
      if (isLineTerminator(ch)) {
        if (index < source.length && ch == '\r' &&
            source.charAt(index + 1) == '\n') {
          index++;
        }
        lineStartOffsets.push(index + 1);
      }
    }
    lineStartOffsets.push(MAX_INT_REPRESENTATION);
    return lineStartOffsets;
  }

  function isLineTerminator(ch) {
    switch (ch) {
      case '\n': // Line Feed
      case '\r':  // Carriage Return
      case '\u2028':  // Line Separator
      case '\u2029':  // Paragraph Separator
        return true;
      default:
        return false;
    }
  }

  LineNumberTable.prototype = {
    /**
     * @return {SourcePosition}
     */
    getSourcePosition: function(offset) {
      var line = this.getLine(offset);
      return new SourcePosition(this.sourceFile_, offset, line,
                                this.getColumn(line, offset));
    },

    getLine: function(offset) {
      var index = binarySearch(this.lineStartOffsets_, offset);
      // start of line
      if (index >= 0) {
        return index;
      }
      return -index - 2;
    },

    offsetOfLine: function(line) {
      return this.lineStartOffsets_[line];
    },

    getColumn: function(var_args) {
      var line, offset;
      if (arguments.length >= 2) {
        line = arguments[0];
        offset = arguments[1];
      } else {
        offset = arguments[0];
        line = this.getLine(offset);
      }
      return offset - this.offsetOfLine(line);
    },

    /** @return {SourceRange} */
    getSourceRange: function(startOffset, endOffset) {
      return new SourceRange(this.getSourcePosition(startOffset),
                             this.getSourcePosition(endOffset));
    }
  };

  return {
    LineNumberTable: LineNumberTable
  };
});

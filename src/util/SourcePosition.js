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

traceur.define('util', function() {
  'use strict';

  /**
   * A position in a source string - includes offset, line and column.
   * @param {SourceFile} source
   * @param {number} offset
   * @param {number} line
   * @param {number} column
   * @constructor
   */
  function SourcePosition(source, offset, line, column) {
    this.source = source;
    this.offset = offset;
    this.line = line;
    this.column = column;
  }

  SourcePosition.prototype = {
    toString: function() {
      return (this.source ? this.source.name : '') +
          '(' + (this.line + 1) + ', ' + (this.column + 1) + ')';
    }
  };

  return {
    SourcePosition: SourcePosition
  };
});

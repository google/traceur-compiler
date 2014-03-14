// Copyright 2014 Traceur Authors.
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

import {SourceMapConsumer}
    from '../src/outputgeneration/SourceMapIntegration';


export class SourceMapMapping {
  /**
   * @param {SourceMapConsumer} consumer
   */
  constructor(consumer) {
    this.consumer_ = consumer;
    this.columnsByLine_ = [];
  }

  lastPosition(columnsByLine) {
    var line = columnsByLine.length - 1;
    var columns = columnsByLine[line];
    return {
      line: line,
      column: columns[columns.length - 1]
    };
  }

  nextLineWithColumns(columnsByLine, line) {
    while (line < columnsByLine.length) {
      if (columnsByLine[line])
        return line;
      line++;
    }
  }

  columnIndexGreaterOrEqual(columns, column) {
    if (!columns.length)
      return;
    var start = 0;
    if (column < columns[start])
      return start;
    var end = columns.length - 1;
    if (column > columns[end])
      return;

    var middle;
    var candidate;
    function lastDupe(index) {
      for(; index < columns.length; index++) {
        if (columns[index] !== columns[index + 1])
          return index;
      }
    }

    while (start + 1 < end) {
      middle = Math.floor((start + end) / 2);
      candidate = columns[middle];
      if (candidate > column)
        end = middle;
      else if (candidate < column)
        start = middle;
      else
        return lastDupe(middle);
    }
    return end;
  }

  nextPosition_(position, columnsByLine) {
    var line = position.line;
    var columnIndex;
    line = this.nextLineWithColumns(columnsByLine, line);
    if (typeof line !== 'number')
      return this.lastPosition(columnsByLine);
    var columns = columnsByLine[line];
    if (!columns)
      return this.lastPosition(columnsByLine);

    columnIndex = this.columnIndexGreaterOrEqual(columns, position.column);

    var nextColumn;
    if (typeof columnIndex === 'number')
      nextColumn = columnsByLine[line][columnIndex + 1];

    if (typeof nextColumn !== 'number') {
      // Use the first column in the next line.
      line = this.nextLineWithColumns(columnsByLine, ++line);
      if (line)
        nextColumn = columnsByLine[line][0];
      if (typeof nextColumn !== 'number') // use the last col of the last line
        return this.lastPosition(columnsByLine);
    }
    return {
      line: line,
      column: nextColumn
    };
  }

  nextPosition(position) {
    return this.nextPosition_(position, this.columnsByLine_);
  }

  rangeFrom(position) {
    var nextPosition = this.nextPosition(position);
    return [position, nextPosition];
  }

}

export class OriginalSourceMapMapping extends SourceMapMapping {
  /**
   * @param {SourceMapConsumer} consumer
   * @param {string} which source to iterate
    */
  constructor(consumer, url) {
    super(consumer);

    consumer.eachMapping((mapping) => {
      if (url && mapping.source !== url)
        return;
      var line = mapping.originalLine;
      this.columnsByLine_[line] = this.columnsByLine_[line] || [];
      this.columnsByLine_[line].push(mapping.originalColumn);
    }, this, SourceMapConsumer.ORIGINAL_ORDER);
  }

  mapPositionFor(position) {
    return this.consumer_.generatedPositionFor(position);
  }
}

export class GeneratedSourceMapMapping extends SourceMapMapping {
  /**
   * @param {SourceMapConsumer} consumer
   * @param {string} which source to iterate
   */
  constructor(consumer, url) {
    super(consumer);
    consumer.eachMapping((mapping) => {
      if (url && mapping.source !== url)
        return;
      var line = mapping.generatedLine;
      this.columnsByLine_[line] = this.columnsByLine_[line] || [];
      this.columnsByLine_[line].push(mapping.generatedColumn);
    }, this, SourceMapConsumer.GENERATED_ORDER);
  }

  mapPositionFor(position) {
    return this.consumer_.originalPositionFor(position);
  }
}
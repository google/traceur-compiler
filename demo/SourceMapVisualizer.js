// Copyright 2016 Traceur Authors.
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

import {
  GeneratedSourceMapMapping,
  OriginalSourceMapMapping
} from './SourceMapMapping.js';
import {SourceMapConsumer}
    from 'traceur@0.0/src/outputgeneration/SourceMapIntegration.js';

let markingOptions = {
  className: 'sourceMapRange',
  startStyle: 'sourceMapRangeLeft',
  endStyle: 'sourceMapRangeRight',
};

export class SourceMapVisualizer {

  constructor(input, output) {
    this.input = input;
    this.output = output;

    this.sourceMapUrl = null;
    this.generatedMarker = null;
  }

  updateMap(sourceMapInfo) {
    this.sourceMapUrl = sourceMapInfo.url;
    if (!this.sourceMapUrl) {
      return;
    }
    let consumer = new SourceMapConsumer(sourceMapInfo.map);
    this.originalMap = new OriginalSourceMapMapping(consumer, this.sourceMapUrl);
    this.generatedMap = new GeneratedSourceMapMapping(consumer, this.sourceMapUrl);

    this.updateGenerated();
  }

  updateGenerated() {
    this.updateUI(this.input, this.originalMap, this.output, this.generatedMap);
  }

  updateSource() {
    this.updateUI(this.output, this.generatedMap, this.input, this.originalMap);
  }

  /**
    * Given a codeMirror with a cursor and a sourcemap, mark the other
    * codeMirror across the matching range given by the otherMap.
    */
  updateUI(thisCodeMirror, thisMap, otherCodeMirror, otherMap) {
    if (!this.sourceMapUrl) {
      return;
    }

    let codeMirrorPosition = thisCodeMirror.getCursor();
    let thisPosition = {
      line: codeMirrorPosition.line + 1,
      column: codeMirrorPosition.ch,
      source: this.sourceMapUrl
    }
    let otherPosition = thisMap.mapPositionFor(thisPosition);

    let thisRange = thisMap.rangeFrom(thisPosition);
    let otherRange = otherMap.rangeFrom(otherPosition);

    console.log('map: ' + this.rangeToString(thisRange)
        + ' -> ' + this.rangeToString(otherRange));

    let beginCM = {
      line: otherRange[0].line - 1,
      ch: otherRange[0].column
    };

    let endCM = {
      line: otherRange[1].line - 1,
      ch: otherRange[1].column
    }

    if (this.generatedMarker)
      this.generatedMarker.clear();

    this.generatedMarker =
        otherCodeMirror.markText(beginCM, endCM, markingOptions);
  }

  rangeToString(range) {
    return this.positionToString(range[0]) + '-' + this.positionToString(range[1]);
  }

  positionToString(position) {
    return position.line + ':' + position.column;
  }
}


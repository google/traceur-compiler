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

    this.updateUI();
  }

  updateUI() {
    if (!this.sourceMapUrl) {
      return;
    }

    let codeMirrorPosition = this.input.getCursor();
    let originalPosition = {
      line: codeMirrorPosition.line + 1,
      column: codeMirrorPosition.ch,
      source: this.sourceMapUrl
    }

    let originalRange = this.originalMap.rangeFrom(originalPosition);
    let generatedRange =
        this.generatedMap.rangeFrom(this.originalMap.mapPositionFor(originalPosition));

    let generatedBeginCM = {
      line: generatedRange[0].line - 1,
      ch: generatedRange[0].column
    };

    let generatedEndCM = {
      line: generatedRange[1].line - 1,
      ch: generatedRange[1].column
    }

    if (this.generatedMarker)
      this.generatedMarker.clear();

    this.generatedMarker =
        this.output.markText(generatedBeginCM, generatedEndCM, markingOptions);
  }
}



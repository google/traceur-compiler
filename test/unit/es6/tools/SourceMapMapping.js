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
    from '../../../../src/outputgeneration/SourceMapIntegration';
import {OriginalSourceMapMapping} from '../../../../demo/SourceMapMapping';

System.options.sourceMaps = true;
var testModuleName = System.normalize('./test/unit/runtime/test_a');
var whenSourceMapMapping = System.import(testModuleName).then(() => {
  var mapInfo = System.sourceMapInfo(testModuleName, 'module');
  if (!mapInfo || !mapInfo.sourceMap)
    throw new Error('No source map');
  var consumer = new SourceMapConsumer(mapInfo.sourceMap);
  var sourceMapMapping = new OriginalSourceMapMapping(consumer);
  return sourceMapMapping;
}).catch(function(ex) {
  console.error(ex.stack || ex);
});

suite('SourceMapMapping', function() {
  var columnsByLine = [
    [0, 0, 1, 3, 4, 4],
    [0, 0, 1, 3, 4, 4]
  ];

  test('columnIndexGreaterOrEqual', function(done){
    whenSourceMapMapping.then((sourceMapMapping) => {
      var columns = columnsByLine[0];
      var indexGE = [0, 2, 3, 3, 4, 5, undefined];
      for (var i = 0; i < 7; i++) {
        var testColumn = i;
        var index = sourceMapMapping.columnIndexGreaterOrEqual(columns, testColumn);
        if (testColumn <= columns[columns.length  - 1]) {
          assert(testColumn <= columns[index]);
          assert((columns[index - 1] || columns[0]) <= testColumn);
        } else {
          assert(typeof index === 'undefined');
        }
      }
      done();
    });
  });

  test('testNextPosition', function (done) {
    whenSourceMapMapping.then((sourceMapMapping) => {
      // The .line values are indexes into columnsByLine, becuase we have
      // one source line per array entry. The .column values are indexes into
      // (fictious) source, as are the value in columnsByLine.
      var testPositions = [
        {line: undefined},
        {line: 0, column: 0},
        {line: 0, column: 1},
        {line: 0, column: 4},
        {line: 1, column: 0},
        {line: 1, column: 1},
        {line: 1, column: 9},
      ];
      var expectedPositions = [
        {line: 1, column: 4},
        {line: 0, column: 1},
        {line: 0, column: 3},
        {line: 1, column: 0},
        {line: 1, column: 1},
        {line: 1, column: 3},
        {line: 1, column: 4},
      ];
      testPositions.forEach(function(pos, index) {
        var actual = sourceMapMapping.nextPosition_(pos, columnsByLine);
        assert(expectedPositions[index].line === actual.line);
        assert(expectedPositions[index].column === actual.column);
      });
      done();
    });
  });
});

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

'use strict';

var fs = require('fs');
var traceur = require('./traceur.js');

var System = new traceur.runtime.NodeTraceurLoader();

var traceurMap;

require('source-map-support').install({
  retrieveSourceMap: function(filename) {
    var map = System.getSourceMap(filename);
    if (!map && filename === traceur.binFilename) {
      if (!traceurMap) {
        traceurMap = fs.readFileSync(traceur.binFilename + '.map', 'utf8');
      }
      map = traceurMap;
    }
    if (map) {
      return {
        url: filename,
        map: map
      };
    }
  }
});

Reflect.global.System = System;
System.map = System.semverMap(System.version);

module.exports = System;

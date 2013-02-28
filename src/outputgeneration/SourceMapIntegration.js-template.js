// Copyright 2013 Traceur Authors.
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

var moduleExports = {};

// 'source-map' changes its loading behavior depending on what the 'exports'
// and 'define' symbols refer to.
//
// For the behavior we want, we set up the environment such that:
//
//   exports === undefined
//   define  === undefined
//   this    === moduleExports // Receives the 'sourceMapModule' export.

(function(exports, define) {
// #include ../../third_party/source-map/lib/source-map/array-set.js
// #include ../../third_party/source-map/lib/source-map/base64.js
// #include ../../third_party/source-map/lib/source-map/base64-vlq.js
// #include ../../third_party/source-map/lib/source-map/binary-search.js
// #include ../../third_party/source-map/lib/source-map/util.js
// #include ../../third_party/source-map/lib/source-map/source-map-generator.js
// #include ../../third_party/source-map/lib/source-map/source-map-consumer.js
// #include ../../third_party/source-map/lib/source-map/source-node.js
}).call(moduleExports);

var sourceMapModule = moduleExports.sourceMapModule;

export var base64 = sourceMapModule['base64'];
export var base64Vlq = sourceMapModule['base64-vlq'];
export var binarySearch = sourceMapModule['binary-search'];
export var util = sourceMapModule['util'];
export var SourceMapGenerator = sourceMapModule['source-map-generator'];
export var SourceMapConsumer = sourceMapModule['source-map-consumer'];
export var SourceNode = sourceMapModule['source-node'];

// Copyright 2015 Traceur Authors.
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

function get(name) {
  return $traceurRuntime.ModuleStore.getForTesting(name);
}

var resolveUrl = get('src/util/url.js').resolveUrl;

var url;
var fileLoader;
if (typeof window === 'undefined') {  // Node
  // TOD(arv): Make the system work better with file paths, especially
  // Windows file paths.
  url = process.cwd().replace(/\\/g, '/') + '/test/unit/runtime/';
  fileLoader = require('../../src/node/nodeLoader.js');
} else {  // Browser
  url = resolveUrl(window.location.href, 'test/unit/runtime/modules.js');
  fileLoader = get('src/runtime/webLoader.js').webLoader;
}

export function getTestLoader() {
  var TraceurLoader = get('src/runtime/TraceurLoader.js').TraceurLoader;
  return new TraceurLoader(fileLoader, url);
}

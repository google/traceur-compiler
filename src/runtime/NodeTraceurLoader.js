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
// limitations under the License

import {TraceurLoader} from './TraceurLoader.js';
import {NodeLoaderCompiler} from '../node/NodeLoaderCompiler.js';

let fs = require('fs');
let path = require('path');
let fileloader = require('../node/nodeLoader.js');

export class NodeTraceurLoader extends TraceurLoader {
  constructor() {
    let url = (path.resolve('./') + '/').replace(/\\/g, '/');
    super(fileloader, url, new NodeLoaderCompiler());
    this.traceurMap_ = null;  // optional cache for sourcemap
  }

  getSourceMap(filename) {
    var map = super.getSourceMap(filename);
    if (!map && filename.replace(/\\/g, '/').endsWith('/bin/traceur.js')) {
      if (!this.traceurMap_) {
        this.traceurMap_ =
            fs.readFileSync(filename + '.map', 'utf8');
      }
      map = this.traceurMap_;
    }
    return map;
  }
}

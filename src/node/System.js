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
var path = require('path');

var nodeLoader = require('./nodeLoader.js');
var url = (path.resolve('./') + '/').replace(/\\/g, '/');


var LoaderCompiler = traceur.runtime.LoaderCompiler;
var NodeLoaderCompiler = function() {
  LoaderCompiler.call(this);
  this._sourceMapsByFilename = Object.create(null);
};

NodeLoaderCompiler.prototype = {
  __proto__: LoaderCompiler.prototype,
  evaluateCodeUnit: function(codeUnit) {
    var result =
    		module._compile(codeUnit.metadata.transcoded, codeUnit.address);
    // If sourceMap option is true, save the map by filename
    if (codeUnit.metadata.sourceMap) {
    	this._sourceMapsByFilename[codeUnit.address] =
    			codeUnit.metadata.sourceMap;
    }
    codeUnit.metadata.transformedTree = null;
    return result;
  },
  getSourceMap: function(filename) {
  	return this._sourceMapsByFilename[filename];
  }
};

var nodeLoaderCompiler = new NodeLoaderCompiler();

var System = new traceur.runtime.TraceurLoader(nodeLoader, url,
    nodeLoaderCompiler);

require('source-map-support').install({
  retrieveSourceMap: function(filename) {
  	var map = nodeLoaderCompiler.getSourceMap(filename);
  	if (map) {
  	var info = System.sourceMapInfo(filename, 'module');
  	console.log('found map and info is ', info);
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

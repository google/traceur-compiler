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

/* @fileoverview Wrap Mocha in es6 layer, extend to accept VinylFiles */

var Mocha = require('mocha');
var path = require('path');
var Runner = require('mocha/lib/runner');
var reporters = require('mocha/lib/reporters');

export class Mocha6 extends Mocha {

	constructor(options) {
		super(options);
		this._vinylFiles = Object.create(null);
	}

	/**
	 * Replace Mocha.loadFiles with promise-returning version that does not
	 * rely solely on `require()`
	 */
	promiseLoadFiles(fn) {
		console.log('promiseLoadFiles', this.files);
		return Promise.all(this.files.map((file) => {
			this.suite.emit('pre-require', global, file, this);
			return this.promiseModuleEvaluated(file).then((module) => {
				this.suite.emit('require', module, file, this);
    		this.suite.emit('post-require', global, file, this);
			});
		})).then(fn);
	}

	promiseModuleEvaluated(file) {
		console.log('promiseModuleEvaluated ' + file, this._vinylFiles[file])
		if (this._vinylFiles[file]) {
			var normalizedName = System.normalize(file);
			var source = this._vinylFiles[file].contents.toString();
			var metadata = {
				traceurOptions: {
					sourceMaps: 'memory'
				}
			};
			return System.define(normalizedName, source, {metadata: metadata}).
				 then(() => {
				 	return System.get(normalizedName);
				 });
		}
		return System.import(file);
	}

	addVinylFile(file) {
	  this._vinylFiles[file.path] = file;
	  this.addFile(file.path);
	  return this;
	};

	promiseRun(fn) {
	  return this.promiseLoadFiles().then(() => {
	  	console.log('promiseRun then')
		  var suite = this.suite;
		  var options = this.options;
		  options.files = this.files;
		  var runner = new Runner(suite);
		  var reporter = new this._reporter(runner, options);
		  runner.ignoreLeaks = false !== options.ignoreLeaks;
		  runner.asyncOnly = options.asyncOnly;
		  if (options.grep) runner.grep(options.grep, options.invert);
		  if (options.globals) runner.globals(options.globals);
		  if (options.growl) this._growl(runner, reporter);
		  reporters.Base.useColors = options.useColors;
		  reporters.Base.inlineDiffs = options.useInlineDiffs;
		  return runner.run(fn);
	  });
	}
}

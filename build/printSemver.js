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

// incrementSemver:
// update package.json to the semver number for the next PATCH level 
// (Similar to npm version, but also changes devDependency)


var fs = require('fs');
var path = require('path');
var semver = require('semver');

function incrementPatchVersion(data) {
	var version = data.version;
	var incrementVersion = semver.inc(version, 'patch');
	data.version = incrementVersion;
	data.devDependencies.traceur = version;
	return data;
}

function filename() {
	return path.join(__dirname, '..', 'package.json');
}

function printSemver() {
	var data = require(filename());
	console.log(data.version);	
}

function incrementSemver() {
	var data = require(filename());
	data = incrementPatchVersion(data);
	fs.writeFileSync(filename(), JSON.stringify(data, null, 2) + '\n');
}

module.exports = {
	printSemver: printSemver,
	incrementSemver: incrementSemver
};
printSemver();
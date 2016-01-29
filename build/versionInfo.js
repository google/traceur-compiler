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

function checkedData() {
	var data = require(filename());
	if (!data) {
		throw new Error('Unable to load ' + filename());
	}
	return data;
}

function getVersion() {
	return checkedData().version;
}

function printSemver() {
	console.log(getVersion());
}

function incrementSemver() {
	data = incrementPatchVersion(checkedData());
	fs.writeFileSync(filename(), JSON.stringify(data, null, 2) + '\n');
}

function printVersionModule() {
	console.log('export let version = \'' + getVersion() + '\';' +
			' // generated source, do not edit');
}

module.exports = {
	printSemver: printSemver,
	incrementSemver: incrementSemver
};

if (process.argv[2] == '-v') {
	printSemver();
} else if (process.argv[2] == '-m') {
	printVersionModule();
} else if (process.argv[2] == '-n') {
	incrementSemver();
} else {
	console.log('Usage: ' + process.argv[1] + ' -v // print semver');
	console.log('Usage: ' + process.argv[1] + ' -m // print version module');
	console.log('Usage: ' + process.argv[1] + ' -n // increment semver');
}

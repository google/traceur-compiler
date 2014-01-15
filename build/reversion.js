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

// reversion:
// update package.json to the semver number for the next PATCH level 
// (Similar to npm version)


var fs = require('fs');
var path = require('path');
var semver = require('semver');

function write(filename, data, callback) {
	fs.writeFile( filename, 
			new Buffer(JSON.stringify(data, null, 2) + "\n"), callback);
}

function edit(data) {
	var version = data.version;
	var reversion = semver.inc(version, 'patch');
	data.version = reversion;
	data.devDependencies.traceur = reversion;
	return data;
}

function reversion(doWrite) {
	var filename = path.join(__dirname + "/../package.json");
	fs.readFile(filename, function (err, json) {
		if (err)
			throw err;

		var data = JSON.parse(json);
		data = edit(data);
		if (doWrite)
			write(filename, data, function() {});
		else 
			console.log(data.version);
	});
}

module.exports = reversion;
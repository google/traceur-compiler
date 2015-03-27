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

import {suite, test, assert} from '../../unit/unitTestRunner.js';

suite('node-only: interpreter', function(){

  var exec = require('child_process').exec;
  var debug = false;

	function log(stdout, stderr) {
		console.log('stdout:\n', stdout, '\n---');
		if (stderr)
			console.log('stderr:\n', stderr, '\n---');
	}

	test('calls System', function() {
		var cmd = './traceur ./test/unit/runtime/resources/call_loader.js';
		exec(cmd, function(error, stdout, stderr) {
			if (debug)
				log(stdout, stderr);
			// The assserts are in the code we exed here.
		});
	});

});
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

var fs = require('fs');
var path = require('path');

var filename = '../../../bin/traceur-runtime.js';
filename = path.join(path.dirname(module.filename), filename);
var data = fs.readFileSync(filename, 'utf8');
if (!data)
  throw new Error('Failed to import ' + filename);

('global', eval)(data);

var setupGlobalsSrc = $traceurRuntime.setupGlobals + '';
if (setupGlobalsSrc.indexOf('polyfill(global);') === -1) 
	throw new Error('bin/traceur-runtime.js does not contain the polyfill');
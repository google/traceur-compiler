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
var nodeLoader = require('./nodeLoader.js');
var path = require('path');
var reporter = new traceur.util.ErrorReporter();
var LoaderHooks = traceur.runtime.LoaderHooks;
var url = (path.resolve('./') + '/').replace(/\\/g, '/');
var loaderHooks = new LoaderHooks(reporter, url, nodeLoader);

var System = new traceur.runtime.TraceurLoader(loaderHooks);

global.System = System;

// If we are compiling into a package namespace, set up an alias table
// for the versions of the package.
var referrerName = traceur.options.referrer;
if (referrerName)
	System.map = System.semverMap(referrerName);
else
	System.map = System.semverMap(System.version);

module.exports = System;

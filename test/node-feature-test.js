// Copyright 2013 Traceur Authors.
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
var path = require('path');

var traceur = require('../src/node/traceur.js');
var testUtil = require('./test-utils.js');
var parseProlog = testUtil.parseProlog;
var featureSuite = testUtil.featureSuite;
var testList = require('./test-list.js').testList;
var nodeLoader = require('../src/node/nodeLoader.js');
var System = require('../src/node/System.js');

process.chdir('test');

featureSuite(testList, nodeLoader);

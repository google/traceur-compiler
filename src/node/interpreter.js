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
var traceur = require('./traceur.js');
var nodeLoader = require('./nodeLoader.js');

function interpret(filename, argv, flags) {
  var execArgv = [require.main.filename].concat(flags || []);

  filename = fs.realpathSync(filename);
  process.argv = ['traceur', filename].concat(argv || []);
  process.execArgv = process.execArgv.concat(execArgv);

  if (traceur.options.deferredFunctions)
    require('./deferred.js').wrap();

  // TODO(jjb): Should be system loader.
  function getLoader() {
    var LoaderHooks = traceur.modules.LoaderHooks;
    var url = __filename.replace(/\\/g, '/');
    var reporter = new traceur.util.ErrorReporter();
    var loaderHooks = new LoaderHooks(reporter, url, null, nodeLoader);
    return new traceur.modules.Loader(loaderHooks);
  }
  global.system = getLoader();
  global.system.import(filename);
}

module.exports = interpret;

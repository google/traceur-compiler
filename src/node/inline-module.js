// Copyright 2012 Traceur Authors.
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
var nodeLoader = require('./nodeLoader.js');
var normalizePath = require('./file-util.js').normalizePath;

var ErrorReporter = traceur.util.ErrorReporter;
var TraceurLoader = traceur.runtime.TraceurLoader;
var LoaderHooks = traceur.runtime.LoaderHooks;
var Script = traceur.syntax.trees.Script;
var SourceFile = traceur.syntax.SourceFile
var moduleStore = traceur.runtime.ModuleStore;

/**
 * @param {ErrorReporter} reporter
 * @param {Array.<ParseTree>} elements
 * @param {string|undefined} depTarget A valid depTarget means dependency
 *     printing was requested.
 */
function InlineLoaderHooks(reporter, url, elements, depTarget) {
  LoaderHooks.call(this, reporter, url,
      nodeLoader,  // Load modules using node fs.
      moduleStore);  // Look up modules in our static module store
  this.dirname = url;
  this.elements = elements;
  this.depTarget = depTarget && normalizePath(path.relative('.', depTarget));
  this.codeUnitList = [];
}

InlineLoaderHooks.prototype = {
  __proto__: LoaderHooks.prototype,

  evaluateCodeUnit: function(codeUnit) {
    if (this.depTarget) {
      console.log('%s: %s', this.depTarget,
                  normalizePath(path.relative(path.join(__dirname, '../..'),
                  codeUnit.url)));
    }
    // Don't eval. Instead append the trees to the output.
    var tree = codeUnit.metadata.transformedTree;
    this.elements.push.apply(this.elements, tree.scriptItemList);
  },

};

function allLoaded(url, reporter, elements) {
  return new Script(null, elements);
}

/**
 * Compiles the files in "filenames" along with any associated modules, into a
 * single js file, in proper module dependency order.
 *
 * @param {Array.<string>} filenames The list of files to compile and concat.
 * @param {Object} options A container for misc options. 'depTarget' is the
 *     only currently available option, which results in the dependencies for
 *     'filenames' being printed to stdout, with 'depTarget' as the target.
 * @param {ErrorReporter} reporter
 * @param {Function} callback Callback used to return the result. A null result
 *     indicates that inlineAndCompile has returned successfully from a
 *     non-compile request.
 * @param {Function} errback Callback used to return errors.
 */
function inlineAndCompile(filenames, options, reporter, callback, errback) {

  var depTarget = options && options.depTarget;
  var referrerName = options && options.referrer;

  var basePath;
  if (referrerName) {
    // The compile occurs two directories down from current directory,
    // in src/node.  Thus the names will appear as eg ../src/x.
    // We want something like referrerName/src/x. So we need to give
    // the normalize() the 'package' or root name with src/node append
    // to represent the referrer from here.
    referrerName = referrerName && referrerName + 'src/node';
    // The basePath will replace options.referrer in our final filename.
    // Since we are in src/node, we need to back up two directories.
    basePath = path.join(__dirname, '../../');
  } else {
    basePath = path.resolve('./') + '/';
  }
  basePath = basePath.replace(/\\/g, '/');

  var scriptsCount = options.scripts.length;

  var loadCount = 0;
  var elements = [];
  var hooks = new InlineLoaderHooks(reporter, basePath, elements, depTarget);
  var loader = new TraceurLoader(hooks);

  function appendEvaluateModule(name, referrerName) {
    var normalizedName =
        traceur.ModuleStore.normalize(name, referrerName);
    // Create tree for System.get('normalizedName');
    var tree =
        traceur.codegeneration.module.createModuleEvaluationStatement(normalizedName);
    elements.push(tree);
  }

  function loadNext() {
    var loadAsScript = scriptsCount && (loadCount < scriptsCount);
    var doEvaluateModule = false;
    var loadFunction = loader.import;
    var name = filenames[loadCount];
    if (loadAsScript) {
      loadFunction = loader.loadAsScript;
    } else {
      name = name.replace(/\.js$/,'');
      if (options.modules !== 'inline' && options.modules !== 'instantiate')
        doEvaluateModule = true;
    }
    var loadOptions = {referrerName: referrerName};
    var codeUnit = loadFunction.call(loader, name, loadOptions).then(
        function() {
          if (doEvaluateModule)
            appendEvaluateModule(name, referrerName);
          loadCount++;
          if (loadCount < filenames.length) {
            loadNext();
          } else if (depTarget) {
            callback(null);
          } else {
            var tree = allLoaded(basePath, reporter, elements);
            callback(tree);
          }
        }, function(err) {
          errback(err);
        });
  }

  loadNext();
}
exports.inlineAndCompile = inlineAndCompile;

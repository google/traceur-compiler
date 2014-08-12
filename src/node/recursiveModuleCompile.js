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
var util = require('./file-util.js');
var normalizePath = util.normalizePath;
var mkdirRecursive = util.mkdirRecursive;
var treeToString = require('./NodeCompiler.js').treeToString;
var writeCompiledCodeToFile =
    require('./NodeCompiler.js').writeCompiledCodeToFile;

function writeTreeToFile(tree, filename, useSourceMaps, opt_sourceRoot) {
  var options = {sourceMaps: useSourceMaps};
  var result = treeToString({tree: tree, options: options, errors: []});
  writeCompiledCodeToFile(result.js, filename, result.generatedSourceMap);
}

function recursiveModuleCompileToSingleFile(outputFile, includes, useSourceMaps) {
  var resolvedOutputFile = path.resolve(outputFile);
  var outputDir = path.dirname(resolvedOutputFile);

  // Resolve includes before changing directory.
  var resolvedIncludes = includes.map(function(include) {
    include.name = path.resolve(include.name);
    return include;
  });

  mkdirRecursive(outputDir);
  process.chdir(outputDir);

  // Make includes relative to output dir so that sourcemap paths are correct.
  resolvedIncludes = resolvedIncludes.map(function(include) {
    include.name = normalizePath(path.relative(outputDir, include.name));
    return include;
  });

  recursiveModuleCompile(resolvedIncludes, traceur.options, function(tree) {
    writeTreeToFile(tree, resolvedOutputFile, useSourceMaps);
    process.exit(0);
  }, function(err) {
    console.error(err);
    process.exit(1);
  });
}

function forEachRecursiveModuleCompile(outputDir, includes, useSourceMaps) {
  var outputDir = path.resolve(outputDir);

  var current = 0;

  function next() {
    if (current === includes.length)
      process.exit(0);

    recursiveModuleCompile(includes.slice(current, current + 1), traceur.options,
        function(tree) {
          var outputFile = path.join(outputDir, includes[current].name);
          var sourceRoot = path.relative(path.dirname(outputFile), '.');
          writeTreeToFile(tree, outputFile, useSourceMaps, sourceRoot);
          current++;
          next();
        },
        function(err) {
          process.exit(1);
        });
  }

  next();
}

var TraceurLoader = traceur.runtime.TraceurLoader;
var InlineLoaderHooks = traceur.runtime.InlineLoaderHooks;
var Script = traceur.syntax.trees.Script;
var SourceFile = traceur.syntax.SourceFile
var moduleStore = traceur.runtime.ModuleStore;



/**
 * Compiles the files in "fileNamesAndTypes" along with any associated modules,
 * into a single js file, in module dependency order.
 *
 * @param {Array.<Object>} fileNamesAndTypes The list of {name, type}
 *     to compile and concat; type is 'module' or 'script'
 * @param {Object} options A container for misc options. 'depTarget' is the
 *     only currently available option, which results in the dependencies for
 *     'fileNamesAndTypes' being printed to stdout, with 'depTarget' as the target.
 * @param {Function} callback Callback used to return the result. A null result
 *     indicates that recursiveModuleCompile has returned successfully from a
 *     non-compile request.
 * @param {Function} errback Callback used to return errors.
 */
function recursiveModuleCompile(fileNamesAndTypes, options, callback, errback) {

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

  var loadCount = 0;
  var elements = [];
  var hooks = new InlineLoaderHooks(basePath, elements,
      nodeLoader,  // Load modules using node fs.
      moduleStore);  // Look up modules in our static module store

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
    var doEvaluateModule = false;
    var loadFunction = loader.import;
    var input = fileNamesAndTypes[loadCount];
    var name = input.name;
    var moduleOption = options.modules;
    if (input.type === 'script') {
      loadFunction = loader.loadAsScript;
    } else {
      name = name.replace(/\.js$/,'');
      if (input.format === 'inline')
        options.modules = 'inline';
      else if (options.modules === 'register')
        doEvaluateModule = true;
    }
    var loadOptions = {referrerName: referrerName};
    var codeUnit = loadFunction.call(loader, name, loadOptions).then(
        function() {
          options.modules = moduleOption;
          if (doEvaluateModule)
            appendEvaluateModule(name, referrerName);

          loadCount++;
          if (loadCount < fileNamesAndTypes.length) {
            loadNext();
          } else if (depTarget) {
            callback(null);
          } else {
            var tree = hooks.toTree(basePath, elements);
            callback(tree);
          }
        }, function(err) {
          errback(err);
        }).catch(function(ex) {
          console.error('Internal error ' + (ex.stack || ex));
        });
  }

  loadNext();
}
exports.recursiveModuleCompile = recursiveModuleCompile;
exports.recursiveModuleCompileToSingleFile = recursiveModuleCompileToSingleFile;
exports.forEachRecursiveModuleCompile = forEachRecursiveModuleCompile;

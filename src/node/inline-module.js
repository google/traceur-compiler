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

var fs = require('fs');
var path = require('path');
var NodeLoader = require('./NodeLoader.js');
var normalizePath = require('./file-util.js').normalizePath;

var ErrorReporter = traceur.util.ErrorReporter;
var InternalLoader = traceur.modules.internals.InternalLoader;
var ModuleAnalyzer = traceur.semantics.ModuleAnalyzer;
var ModuleDefinition = traceur.syntax.trees.ModuleDefinition;
var ModuleRequireVisitor = traceur.codegeneration.module.ModuleRequireVisitor;
var ModuleSymbol = traceur.semantics.symbols.ModuleSymbol;
var ModuleTransformer = traceur.codegeneration.ModuleTransformer;
var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;
var Parser = traceur.syntax.Parser;
var Script = traceur.syntax.trees.Script;
var ModuleSpecifier = traceur.syntax.trees.ModuleSpecifier;
var ProgramTransformer = traceur.codegeneration.ProgramTransformer;
var Project = traceur.semantics.symbols.Project;
var SourceFile = traceur.syntax.SourceFile
var SourceMapGenerator = traceur.outputgeneration.SourceMapGenerator;
var TreeWriter = traceur.outputgeneration.TreeWriter;
var IDENTIFIER = traceur.syntax.TokenType.IDENTIFIER;

var createIdentifierExpression = ParseTreeFactory.createIdentifierExpression;
var createIdentifierToken = ParseTreeFactory.createIdentifierToken;
var createStringLiteralToken = ParseTreeFactory.createStringLiteralToken;
var resolveUrl = traceur.util.resolveUrl;

/**
 * Generates an identifier string that represents a URL.
 * @param {string} url
 * @param {string} commonPath
 * @return {string}
 */
function generateNameForUrl(url, commonPath) {
  return '$__' + url.replace(commonPath, '').replace(/[^\d\w$]/g, '_');
}

/**
 * Wraps a program in a module definition.
 * @param  {Script} tree The original program tree.
 * @param  {string} url The relative URL of the module that the program
 *     represents.
 * @param {string} commonPath The base path of all the files. This is passed
 *     along to |generateNameForUrl|.
 * @return {[Script} A new program tree with only one statement, which is
 *     a module definition.
 */
function wrapScript(tree, url, commonPath) {
  return new Script(null,
      [new ModuleDefinition(null,
          createStringLiteralToken(url), tree.programElements)]);
}

/**
 * This transformer replaces
 *
 *   import * from "url"
 *
 * with
 *
 *   import * from $_name_associated_with_url
 *
 * @param {string} url The base URL that all the modules should be relative
 *     to.
 * @param {string} commonPath The path that is common for all URLs.
 */
function ModuleRequireTransformer(url, commonPath, isStart) {
  ParseTreeTransformer.call(this);
  this.url = url;
  this.commonPath = commonPath;
  this.isStart = isStart
}

ModuleRequireTransformer.prototype = {
  __proto__: ParseTreeTransformer.prototype,
  transformModuleSpecifier: function(tree) {
    if (!this.isStart)
      return tree;

    var url = tree.token.processedValue;

     // Don't handle builtin modules.
    if (url.charAt(0) === '@')
      return tree;

    url = resolveUrl(this.url, url);

    return new ModuleSpecifier(tree.location, createStringLiteralToken(url));
  }
};

var startCodeUnit;

/**
 * @param {ErrorReporter} reporter
 * @param {Project} project
 * @param {Array.<ParseTree>} elements
 * @param {string|undefined} depTarget A valid depTarget means dependency
 *     printing was requested.
 */
function InlineCodeLoader(reporter, project, elements, depTarget) {
  InternalLoader.call(this, reporter, project, new NodeLoader);
  this.elements = elements;
  this.dirname = project.url;
  this.depTarget = depTarget && normalizePath(path.relative('.', depTarget));
  this.codeUnitList = [];
}

InlineCodeLoader.prototype = {
  __proto__: InternalLoader.prototype,

  evalCodeUnit: function(codeUnit) {
    // Don't eval. Instead append the trees to the output.
    var tree = codeUnit.transformedTree;
    this.elements.push.apply(this.elements, tree.programElements);
  },

  transformCodeUnit: function(codeUnit) {
    var transformer = new ModuleRequireTransformer(
          codeUnit.url,
          this.dirname,
          codeUnit === startCodeUnit);
    var tree = transformer.transformAny(codeUnit.tree);
    if (this.depTarget) {
      console.log('%s: %s', this.depTarget,
                  normalizePath(path.relative(path.join(__dirname, '../..'), codeUnit.url)));
    }
    if (codeUnit === startCodeUnit)
      return tree;
    return wrapScript(tree, codeUnit.url, this.dirname);
  }
};

function allLoaded(url, reporter, elements) {
  var project = new Project(url);
  var programTree = new Script(null, elements);

  var file = new SourceFile(project.url, '/* dummy */');
  project.addFile(file);
  project.setParseTree(file, programTree);

  var analyzer = new ModuleAnalyzer(reporter, project);
  analyzer.analyze();

  var transformer = new ProgramTransformer(reporter, project);
  return transformer.transform(programTree);
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

  // The caller needs to do a chdir.
  var basePath = './';
  var depTarget = options && options.depTarget;

  var loadCount = 0;
  var elements = [];
  var project = new Project(basePath);
  var loader = new InlineCodeLoader(reporter, project, elements, depTarget);

  function loadNext() {
    var codeUnit = loader.load(filenames[loadCount]);
    startCodeUnit = codeUnit;

    codeUnit.addListener(function() {
      loadCount++;
      if (loadCount < filenames.length) {
        loadNext();
      } else if (depTarget) {
        callback(null);
      } else {
        var tree = allLoaded(basePath, reporter, elements);
        callback(tree);
      }
    }, function() {
      console.error(codeUnit.loader.error);
      errback(codeUnit.loader.error);
    });
  }

  loadNext();
}

function inlineAndCompileSync(filenames, options, reporter) {
  // The caller needs to do a chdir.
  var basePath = './';
  var depTarget = options && options.depTarget;

  var loadCount = 0;
  var elements = [];
  var project = new Project(basePath);
  var loader = new InlineCodeLoader(reporter, project, elements, depTarget);

  filenames.forEach(function(filename) {
    filename = resolveUrl(basePath, filename);
    startCodeUnit = loader.getCodeUnit(filename);
    loader.loadSync(filename);
  });
  return allLoaded(basePath, reporter, elements);
}

exports.inlineAndCompile = inlineAndCompile;
exports.inlineAndCompileSync = inlineAndCompileSync;

#!/usr/bin/env node

// Copyright 2011 Google Inc.
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

(function() {
  'use strict';

  if (process.argv.length <= 2) {
    console.log('Usage: node ' + process.argv[1] + ' [OPTIONS] filename.js...');
    process.exit(1);
  }

  var fs = require('fs');
  var path = require('path');

  /**
   * Reads a script and eval's it into the global scope.
   * TODO: this is needed for now because of how our scripts are designed.
   * Change this once we have a module system.
   * @param {string} filename
   */
  function importScript(filename) {
    filename = path.join(path.dirname(process.argv[1]), filename);
    var data = fs.readFileSync(filename);
    if (!data) {
      throw new Error('Failed to import ' + filename);
    }
    data = data.toString('utf8');
    eval.call(global, data);
  }

  // Allow traceur.js to use importScript.
  global.traceurImportScript = importScript;

  importScript('./traceur.js');

  var ErrorReporter = traceur.util.ErrorReporter;
  var ModuleAnalyzer = traceur.semantics.ModuleAnalyzer;
  var ModuleDefinition = traceur.syntax.trees.ModuleDefinition;
  var Program = traceur.syntax.trees.Program;
  var ModuleRequireVisitor = traceur.codegeneration.module.ModuleRequireVisitor;
  var ModuleSymbol = traceur.semantics.symbols.ModuleSymbol;
  var ModuleTransformer = traceur.codegeneration.ModuleTransformer;
  var ParseTreeTransformer = traceur.codegeneration.ParseTreeTransformer;
  var Parser = traceur.syntax.Parser;
  var ProgramTransformer = traceur.codegeneration.ProgramTransformer;
  var Project = traceur.semantics.symbols.Project;
  var SourceFile = traceur.syntax.SourceFile
  var TreeWriter = traceur.outputgeneration.TreeWriter;
  var ParseTreeType = traceur.syntax.trees.ParseTreeType;
  var SourceMapGenerator = traceur.outputgeneration.SourceMapGenerator;

  var canonicalizeUrl = traceur.util.canonicalizeUrl;
  var createIdentifierToken = traceur.codegeneration.ParseTreeFactory.createIdentifierToken;
  var createIdentifierExpression = traceur.codegeneration.ParseTreeFactory.createIdentifierExpression;
  var evaluateStringLiteral = traceur.util.evaluateStringLiteral;
  var resolveUrl = traceur.util.resolveUrl;

  var outDirName = 'out';

  /**
   * Recursively makes all directoires, similar to mkdir -p
   * @param {string} dir
   */
  function mkdirRecursive(dir) {
    var parts = path.normalize(dir).split('/');

    dir = '';
    for (var i = 0; i < parts.length; i++) {
      dir += parts[i] + '/';
      if (!path.existsSync(dir)) {
        fs.mkdirSync(dir, 0x1FF);
      }
    }
  }

  /**
   * Removes the common prefix of basedir and filedir from filedir
   * @param {string} basedir
   * @param {string} filedir
   */
  function removeCommonPrefix(basedir, filedir) {
    var baseparts = basedir.split('/');
    var fileparts = filedir.split('/');

    var i = 0;
    while (i < fileparts.length && fileparts[i] === baseparts[i]) {
      i++;
    }
    return fileparts.slice(i).join('/');
  }

  function writeFile(filename, contents) {
    // Compute the output path
    var outputdir = fs.realpathSync(process.cwd());
    var filedir = fs.realpathSync(path.dirname(filename));
    filedir = removeCommonPrefix(outputdir, filedir);
    outputdir = path.join(outputdir, outDirName, filedir);

    mkdirRecursive(outputdir);
    var outputfile = path.join(outputdir, path.basename(filename));
    fs.writeFileSync(outputfile, new Buffer(contents));
    console.log('Writing of out/' + filename + ' successful.');
  }

  function compileFiles(filenames) {
    var reporter = new ErrorReporter();
    var project = new Project(process.cwd());

    console.log('Reading files...');
    var success = filenames.every(function(filename) {
      var data = fs.readFileSync(filename);
      if (!data) {
        console.log('Failed to read ' + filename);
        return false;
      }
      data = data.toString('utf8');
      var sourceFile = new traceur.syntax.SourceFile(filename, data);
      project.addFile(sourceFile);
      return true;
    });

    if (!success)
      return false;

    console.log('Compiling...');
    var results = traceur.codegeneration.Compiler.compile(reporter, project);
    if (reporter.hadError()) {
      console.log('Compilation failed.');
      return false;
    }

    console.log('Compilation successful');

    results.keys().forEach(function(file) {
      var tree = results.get(file);
      var filename = file.name;
      writeTreeToFile(tree, filename);

      if (flags.copyOriginals) {
        var outPath = path.join(outDirName, filename);
        copyFile(filename, outPath);
      }
    });

    return true;
  }

  function getSourceMapFileName(name) {
    return name.replace(/\.js$/, '.map');
  }

  function copyFile(inPath, outPath) {
    console.log('Copying %s to %s', inPath, outPath);
    mkdirRecursive(path.dirname(outPath));
    var inStream = fs.createReadStream(inPath);
    var outStream = fs.createWriteStream(outPath);
    inStream.pipe(outStream);
  }

  function writeTreeToFile(tree, filename) {
    var compiledFilePath = filename.replace(/\.js$/, '.compiled.js');
    var options = null;
    if (flags.sourceMaps) {
      var sourceMapFilePath = getSourceMapFileName(filename);
      var config = {file: path.basename(compiledFilePath)};
      var sourceMapGenerator = new SourceMapGenerator(config);
      options = {sourceMapGenerator: sourceMapGenerator};
    }

    var compiledCode = TreeWriter.write(tree, options);
    if (flags.sourceMaps) {
      compiledCode += '\n//@ sourceMappingURL=' +
          path.basename(sourceMapFilePath);
    }
    writeFile(compiledFilePath, compiledCode);
    if (flags.sourceMaps)
      writeFile(sourceMapFilePath, options.sourceMap);
  }

///////////////////////////////////////////////////////////////////////////////

  function generateNameForUrl(url) {
    return '$' + url.replace(/[^\d\w$]/g, '_');
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
   */
  function Transformer(url) {
    ParseTreeTransformer.call(this);
    this.url = url;
  }

  Transformer.prototype = traceur.createObject(ParseTreeTransformer.prototype, {
    transformModuleRequire: function(tree) {
      var url = evaluateStringLiteral(tree.url);
      // Don't handle builtin modules.
      if (url.charAt(0) === '@')
        return tree;
      url = resolveUrl(this.url, url);

      return createIdentifierExpression(generateNameForUrl(url));
    }
  });


  /**
   * Wraps a program in a module definition.
   * @param  {ProgramTree} tree The original program tree.
   * @param  {string} url The relative URL of the module that the program
   *     represents.
   * @return {[ProgramTree} A new program tree with only one statement, which is
   *     a module definition.
   */
  function wrapProgram(tree, url) {
    var name = generateNameForUrl(url);
    return new Program(null,
        [new ModuleDefinition(null,
            createIdentifierToken(name), tree.programElements)]);
  }

  function inlineAndCompile(filename) {
    console.log('Reading %s', filename);
    var source = fs.readFileSync(filename, 'utf8');
    if (!source) {
      console.log('Failed to read ' + filename);
      return false;
    }

    var dirname = path.dirname(filename);
    var url = path.basename(filename);
    var project = new Project(url);
    var reporter = new ErrorReporter();
    var loader = new traceur.runtime.internals.InternalLoader(reporter,
                                                              project);
    var elements = [];
    var originalFiles = [url];
    loader.evalCodeUnit = function(codeUnit) {
      // Don't eval. Instead append the trees to the output.
      var tree = codeUnit.transformedTree;
      elements.push.apply(elements, tree.programElements);
    };
    loader.transformCodeUnit = function(codeUnit) {
      console.log('Compiling %s', path.join(dirname, codeUnit.url));
      var transformer = new Transformer(codeUnit.url);
      var tree = transformer.transformAny(codeUnit.tree);
      if (!(codeUnit instanceof traceur.runtime.internals.EvalLoadCodeUnit))
        tree = wrapProgram(tree, codeUnit.url);
      return tree;
    };
    loader.loadTextFile = function(filename, callback, errback) {
      console.log('Reading %s', path.join(dirname, filename));
      originalFiles.push(filename);
      var text;
      fs.readFile(path.resolve(dirname, filename), 'utf8', function(err, data) {
        if (err) {
          errback(err);
        } else {
          text = data;
          callback(data);
        }
      });

      return {
        get responseText() {
          return text;
        },
        abort: function() {}
      };
    };

    var codeUnit = loader.evalLoad(source);
    codeUnit.addListener(function() {
      var programTree = new Program(null, elements);
      var project = new Project(url);

      var file = new SourceFile(url, '/* dummy */');
      project.addFile(file);
      project.setParseTree(file, programTree);

      var analyzer = new ModuleAnalyzer(reporter, project);
      analyzer.analyze();

      var transformer = new ProgramTransformer(reporter, project);
      var tree = transformer.transform(programTree);

      writeTreeToFile(tree, filename);

      if (flags.copyOriginals) {
        originalFiles.forEach(function(filename) {
          var inPath = path.join(dirname, filename);
          var outPath = path.join(outDirName, dirname, filename);
          copyFile(inPath, outPath);
        });
      }

    }, function() {
      console.error(codeUnit.loader.error);
      process.exit(2);
    });
    loader.handleCodeUnitLoaded(codeUnit);

    return true;
  }

  var args = process.argv.slice(2);

  var flags = {};
  args = args.filter(function(name) {
    switch (name) {
      case '--inline-modules':
        flags.inlineModules = true;
        return false;
      case '--source-maps':
        flags.sourceMaps = true;
        return false;
      case '--copy-originals':
        flags.copyOriginals = true;
        return false;
    }
    return true;
  });

  var files = args.filter(function(value) {
    return !/^--/.test(value);
  });

  if (flags.inlineModules && files.length !== 1) {
    console.log('Only one file is supported with --inline-modules. ' +
                'Use import statements instead');
    console.log('Usage: node ' + process.argv[1] +
                ' --inline-modules [OPTIONS] filename.js');
    process.exit(1);
  }

  traceur.options.fromArgv(args);

  var success;
  if (flags.inlineModules)
    success = inlineAndCompile(files[0]);
  else
    success = compileFiles(files);

  if (!success)
    process.exit(2);
})();

'use strict';

var traceur = require('./traceur.js');
var inlineAndCompileSync = require('./inline-module.js').inlineAndCompileSync;


var originalRequireJs = require.extensions['.js'];

function requireTraceur(module, filename) {
  var reporter = new traceur.util.ErrorReporter();
  var tree = inlineAndCompileSync([filename], null, reporter);
  var source = traceur.outputgeneration.TreeWriter.write(tree);
  return module._compile(source, filename);
}

require.extensions['.js'] = requireTraceur;

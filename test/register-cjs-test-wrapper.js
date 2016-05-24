'use strict';

var fs = require('fs');
var traceurAPI = require('../src/node/api.js');

var org = require.extensions['.js'];
require.extensions['.js'] = function(module, path) {
  if (!/\/node_modules\//.test(path)) {
    var content = fs.readFileSync(path, 'utf8');
    if (shouldSkip(path, content)) {
      return;
    }

    // TODO(arv): Use parseProlog from src/util/parseProlog.js so that we can
    // compile when we have non default options too.
    var compiled = traceurAPI.compile(content, {
      modules: 'commonjs',
      importRuntime: true,
    }, path, path);


    if (needsWrapper(path)) {
      var header = 'var assert = require("chai").assert, test = require("mocha").test;' + 'test("' + path + '", function(){';
      var footer = '});';
      compiled = header + compiled + footer;
    }

    try {
      return module._compile(compiled, path);
    } catch (ex) {
      console.log(compiled, path);
      throw ex;
    }
  }
  return org(module, path);
};

function needsWrapper(path) {
  return /\/test\/feature\//.test(path) && !/\/resources\//.test(path);
}

var blackList = [
  '/Modules/ModuleName.js',
];

function shouldSkip(path, content) {
  for (var i = 0; i < blackList.length; i++) {
    if (path.indexOf(blackList[i]) !== -1) {
      return true;
    }
  }
  return /\/\/ (Error:|Options:|Skip.|Async.)/.test(content) ||
      /\.script\.js$/.test(path);
}

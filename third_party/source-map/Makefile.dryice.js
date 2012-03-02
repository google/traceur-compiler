/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
var path = require('path');
var fs = require('fs');
var copy = require('dryice').copy;

function buildBrowser() {
  console.log('Creating dist/source-map.js');

  var project = copy.createCommonJsProject({
    roots: [ __dirname ]
  });

  copy({
    source: [
      'build/mini-require.js',
      copy.source.commonjs({
        project: project,
        require: [ 'lib/source-map/source-map-generator',
                   'lib/source-map/source-map-consumer',
                   'lib/source-map/source-node']
      }),
      'build/suffix-browser.js'
    ],
    filter: copy.filter.moduleDefines,
    dest: 'dist/source-map.js'
  });
}

function buildBrowserMin() {
  console.log('Creating dist/source-map.min.js');

  copy({
    source: 'dist/source-map.js',
    filter: copy.filter.uglifyjs,
    dest: 'dist/source-map.min.js'
  });
}

function buildFirefox() {
  console.log('Creating dist/source-map-consumer.jsm');

  var project = copy.createCommonJsProject({
    roots: [ __dirname ]
  });

  copy({
    source: [
      'build/prefix-source-map-consumer.jsm',
      'build/mini-require.js',
      copy.source.commonjs({
        project: project,
        require: [ 'lib/source-map/source-map-consumer' ]
      }),
      'build/suffix-source-map-consumer.jsm'
    ],
    filter: copy.filter.moduleDefines,
    dest: 'dist/SourceMapConsumer.jsm'
  });
}

var dirExists = false;
try {
  dirExists = fs.statSync('dist').isDirectory();
} catch (err) {}

if (!dirExists) {
  fs.mkdirSync('dist', 0777);
}

buildFirefox();
buildBrowser();
buildBrowserMin();

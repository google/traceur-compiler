/* -*- Mode: js; js-indent-level: 2; -*- */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla Source Map.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Nick Fitzgerald <nfitzgerald@mozilla.com> (original author)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
 /*globals require exports module define */
(function (global, factory) { 
    // https://github.com/umdjs/umd/blob/master/returnExportsGlobal.js
    if (typeof exports === 'object') {  // Node. 
      var assert = require('./assert');
      var SourceMapGenerator = require('source-map/source-map-generator');
      var SourceMapConsumer = require('source-map/source-map-consumer');
      var SourceNode = require('source-map/source-node');
      module.exports = factory(assert, SourceMapGenerator, SourceMapConsumer, SourceNode);
    } else if (typeof define === 'function' && define.amd) {
      define(['assert','source-map/source-map-generator','source-map/source-map-consumer','source-map/source-node'], factory);
    } else {// Browser globals
      var testModule = global.testModule = global.testModule || {};
      var assert = testModule['assert'];
      var sourceMapModule = global.sourceMapModule = global.sourceMapModule || {};
      var SourceMapGenerator = sourceMapModule['source-map-generator'];
      var SourceMapConsumer = sourceMapModule['source-map-consumer'];
      var SourceNode = sourceMapModule['source-node'];
      testModule['test-source-node'] = factory(assert, SourceMapGenerator, SourceMapConsumer, SourceNode);
    }
}(this, function (assert, SourceMapGenerator, SourceMapConsumer, SourceNode) {

  var exports = {};

  exports['test .add()'] = function () {
    var node = new SourceNode(null, null, null);

    // Adding a string works.
    node.add('function noop() {}');

    // Adding another source node works.
    node.add(new SourceNode(null, null, null));

    // Adding an array works.
    node.add(['function foo() {',
              new SourceNode(null, null, null,
                             'return 10;'),
              '}']);

    // Adding other stuff doesn't.
    assert.throws(function () {
      node.add({});
    });
    assert.throws(function () {
      node.add(function () {});
    });
  };

  exports['test .toString()'] = function () {
    assert.equal((new SourceNode(null, null, null,
                                 ['function foo() {',
                                  new SourceNode(null, null, null, 'return 10;'),
                                  '}'])).toString(),
                 'function foo() {return 10;}');
  };

  exports['test .join()'] = function () {
    assert.equal((new SourceNode(null, null, null,
                                 ['a', 'b', 'c', 'd'])).join(', ').toString(),
                 'a, b, c, d');
  };

  exports['test .walk()'] = function () {
    var node = new SourceNode(null, null, null,
                              ['(function () {\n',
                               '  ', new SourceNode(1, 0, 'a.js', ['someCall()']), ';\n',
                               '  ', new SourceNode(2, 0, 'b.js', ['if (foo) bar()']), ';\n',
                               '}());']);
    var expected = [
      { str: '(function () {\n', source: null,   line: null, column: null },
      { str: '  ',               source: null,   line: null, column: null },
      { str: 'someCall()',       source: 'a.js', line: 1,    column: 0    },
      { str: ';\n',              source: null,   line: null, column: null },
      { str: '  ',               source: null,   line: null, column: null },
      { str: 'if (foo) bar()',   source: 'b.js', line: 2,    column: 0    },
      { str: ';\n',              source: null,   line: null, column: null },
      { str: '}());',            source: null,   line: null, column: null },
    ];
    var i = 0;
    node.walk(function (chunk, loc) {
      assert.equal(expected[i].str, chunk);
      assert.equal(expected[i].source, loc.source);
      assert.equal(expected[i].line, loc.line);
      assert.equal(expected[i].column, loc.column);
      i++;
    });
  };

  exports['test .toStringWithSourceMap()'] = function () {
    var node = new SourceNode(null, null, null,
                              ['(function () {\n',
                               '  ', new SourceNode(1, 0, 'a.js', ['someCall()']), ';\n',
                               '  ', new SourceNode(2, 0, 'b.js', ['if (foo) bar()']), ';\n',
                               '}());']);
    var map = node.toStringWithSourceMap({
      file: 'foo.js'
    }).map;

    assert.ok(map instanceof SourceMapGenerator, 'map instanceof SourceMapGenerator');
    map = new SourceMapConsumer(map.toString());

    var actual;

    actual = map.originalPositionFor({
      line: 2,
      column: 2
    });
    assert.equal(actual.source, 'a.js');
    assert.equal(actual.line, 1);
    assert.equal(actual.column, 0);

    actual = map.originalPositionFor({
      line: 3,
      column: 2
    });
    assert.equal(actual.source, 'b.js');
    assert.equal(actual.line, 2);
    assert.equal(actual.column, 0);
  };

  return exports;
}));

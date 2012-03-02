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
 /*globals require exports module define*/
 
(function (global, factory) { 
    // https://github.com/umdjs/umd/blob/master/returnExportsGlobal.js
    if (typeof exports === 'object') {  // Node. 
      var assert = require('./assert');
      var util = require('./util');
      var SourceMapConsumer = require('source-map/source-map-consumer');
      module.exports = factory(assert, util, SourceMapConsumer);
    } else if (typeof define === 'function' && define.amd) {
      define(['assert', 'util', 'source-map/source-map-consumer'], factory);
    } else {// Browser globals
      var testModule = global.testModule = global.testModule || {};
      var util = testModule['util'];
      var assert = testModule['assert'];
      var sourceMapModule = global.sourceMapModule = global.sourceMapModule || {};
      var SourceMapConsumer = sourceMapModule['source-map-consumer'];
      testModule['test-source-map-consumer'] = factory(assert, util, SourceMapConsumer);
    }
}(this, function (assert, testUtil, SourceMapConsumer) {

  var exports = {};

  exports['test that we can instantiate with a string or an objects'] = function () {
    assert.doesNotThrow(function () {
      var map = new SourceMapConsumer(testUtil.testMap);
    });
    assert.doesNotThrow(function () {
      var map = new SourceMapConsumer(JSON.stringify(testUtil.testMap));
    });
  };

  exports['test that the source root is reflected in a mapping\'s source field'] = function () {
    var map = new SourceMapConsumer(testUtil.testMap);
    var mapping;

    mapping = map.originalPositionFor({
      line: 2,
      column: 1
    });
    assert.equal(mapping.source, '/the/root/two.js');

    mapping = map.originalPositionFor({
      line: 1,
      column: 1
    });
    assert.equal(mapping.source, '/the/root/one.js');
  };

  exports['test mapping tokens back exactly'] = function () {
    var map = new SourceMapConsumer(testUtil.testMap);

    testUtil.assertMapping(1, 1, '/the/root/one.js', 1, 1, null, map);
    testUtil.assertMapping(1, 5, '/the/root/one.js', 1, 5, null, map);
    testUtil.assertMapping(1, 9, '/the/root/one.js', 1, 11, null, map);
    testUtil.assertMapping(1, 18, '/the/root/one.js', 1, 21, 'bar', map);
    testUtil.assertMapping(1, 21, '/the/root/one.js', 2, 3, null, map);
    testUtil.assertMapping(1, 28, '/the/root/one.js', 2, 10, 'baz', map);
    testUtil.assertMapping(1, 32, '/the/root/one.js', 2, 14, 'bar', map);

    testUtil.assertMapping(2, 1, '/the/root/two.js', 1, 1, null, map);
    testUtil.assertMapping(2, 5, '/the/root/two.js', 1, 5, null, map);
    testUtil.assertMapping(2, 9, '/the/root/two.js', 1, 11, null, map);
    testUtil.assertMapping(2, 18, '/the/root/two.js', 1, 21, 'n', map);
    testUtil.assertMapping(2, 21, '/the/root/two.js', 2, 3, null, map);
    testUtil.assertMapping(2, 28, '/the/root/two.js', 2, 10, 'n', map);
  };

  exports['test mapping tokens back fuzzy'] = function () {
    var map = new SourceMapConsumer(testUtil.testMap);

    testUtil.assertMapping(1, 20, '/the/root/one.js', 1, 21, 'bar', map);
    testUtil.assertMapping(1, 30, '/the/root/one.js', 2, 10, 'baz', map);
    testUtil.assertMapping(2, 12, '/the/root/two.js', 1, 11, null, map);
  };
  
  return exports;
}));

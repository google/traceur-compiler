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
      var ArraySet = require('source-map/array-set');
      module.exports = factory(assert, ArraySet);
    } else if (typeof define === 'function' && define.amd) {
      define(['assert', 'source-map/array-set'], factory);
    } else {// Browser globals
      var testModule = global.testModule = global.testModule || {};
      var assert = testModule['assert'];
      var sourceMapModule = global.sourceMapModule = global.sourceMapModule || {};
      var ArraySet = sourceMapModule['array-set'];
      testModule['test-array-set'] = factory(assert, ArraySet);
    }
}(this, function (assert, ArraySet) {

  var exports = {};

  function makeTestSet() {
    var set = new ArraySet();
    for (var i = 0; i < 100; i++) {
      set.add(String(i));
    }
    return set;
  }

  exports['test .has() membership'] = function () {
    var set = makeTestSet();
    for (var i = 0; i < 100; i++) {
      assert.ok(set.has(String(i)));
    }
  };

  exports['test .indexOf() elements'] = function () {
    var set = makeTestSet();
    for (var i = 0; i < 100; i++) {
      assert.strictEqual(set.indexOf(String(i)), i);
    }
  };

  exports['test .at() indexing'] = function () {
    var set = makeTestSet();
    for (var i = 0; i < 100; i++) {
      assert.strictEqual(set.at(i), String(i));
    }
  };

  exports['test creating from an array'] = function () {
    var set = ArraySet.fromArray(['foo', 'bar', 'baz', 'quux', 'hasOwnProperty']);

    assert.ok(set.has('foo'));
    assert.ok(set.has('bar'));
    assert.ok(set.has('baz'));
    assert.ok(set.has('quux'));
    assert.ok(set.has('hasOwnProperty'));

    assert.strictEqual(set.indexOf('foo'), 0);
    assert.strictEqual(set.indexOf('bar'), 1);
    assert.strictEqual(set.indexOf('baz'), 2);
    assert.strictEqual(set.indexOf('quux'), 3);

    assert.strictEqual(set.at(0), 'foo');
    assert.strictEqual(set.at(1), 'bar');
    assert.strictEqual(set.at(2), 'baz');
    assert.strictEqual(set.at(3), 'quux');
  };
  
  return exports;
  
}));

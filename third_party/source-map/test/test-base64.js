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
      var assert = require('assert');
      var base64 = require('source-map/base64');
      module.exports = factory(assert, base64);
    } else if (typeof define === 'function' && define.amd) {
      define(['assert', 'source-map/base64'], factory);
    } else {// Browser globals
      var testModule = global.testModule = global.testModule || {};
      var assert = testModule['assert'];
      var sourceMapModule = global.sourceMapModule = global.sourceMapModule || {};
      var base64 = sourceMapModule['base64'];
      testModule['test-base64'] = factory(assert, base64);
    }
}(this,  function(assert, base64) {

  var exports = {};

  exports['test out of range encoding'] = function () {
    assert.throws(function () {
      base64.encode(-1);
    });
    assert.throws(function () {
      base64.encode(64);
    });
  };

  exports['test out of range decoding'] = function () {
    assert.throws(function () {
      base64.decode('=');
    });
  };

  exports['test normal encoding and decoding'] = function () {
    for (var i = 0; i < 64; i++) {
      assert.equal(base64.decode(base64.encode(i)), i);
    }
  };

  return exports;
}));

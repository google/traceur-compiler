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
        module.exports = factory(assert);
    } else if (typeof define === 'function' && define.amd) {
        define(['assert'], factory);
    } else {// Browser globals
      var testModule = global.testModule = global.testModule || {};
      var assert = testModule['assert'];
      testModule['util'] = factory(assert);
    }
}(this, function(assert) {

  var exports = {};

  // This is a test mapping which maps functions from two different files
  // (one.js and two.js) to a minified generated source.
  //
  // Here is one.js:
  //
  //   ONE.foo = function (bar) {
  //     return baz(bar);
  //   };
  //
  // Here is two.js:
  //
  //   TWO.inc = function (n) {
  //     return n + 1;
  //   };
  //
  // And here is the generated code (min.js):
  //
  //   ONE.foo=function(a){return baz(a);};
  //   TWO.inc=function(a){return a+1;};
  exports.testMap = {
    version: 3,
    file: 'min.js',
    names: ['bar', 'baz', 'n'],
    sources: ['one.js', 'two.js'],
    sourceRoot: '/the/root',
    mappings: 'CAAC,IAAI,IAAM,SAAUA,GAClB,OAAOC,IAAID;CCDb,IAAI,IAAM,SAAUE,GAClB,OAAOA'
  };

  function assertMapping(generatedLine, generatedColumn, originalSource,
                         originalLine, originalColumn, name, map) {
    var mapping = map.originalPositionFor({
      line: generatedLine,
      column: generatedColumn
    });
    assert.equal(mapping.name, name,
                 'Incorrect name, expected ' + JSON.stringify(name)
                 + ', got ' + JSON.stringify(mapping.name));
    assert.equal(mapping.line, originalLine,
                 'Incorrect line, expected ' + JSON.stringify(originalLine)
                 + ', got ' + JSON.stringify(mapping.line));
    assert.equal(mapping.column, originalColumn,
                 'Incorrect column, expected ' + JSON.stringify(originalColumn)
                 + ', got ' + JSON.stringify(mapping.column));
    assert.equal(mapping.source, originalSource,
                 'Incorrect source, expected ' + JSON.stringify(originalSource)
                 + ', got ' + JSON.stringify(mapping.source));
  }
  exports.assertMapping = assertMapping;

  return exports;
}));

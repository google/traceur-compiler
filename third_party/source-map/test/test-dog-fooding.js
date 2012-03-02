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
      var SourceMapGenerator = require('source-map/source-map-generator');
      module.exports = factory(assert, util, SourceMapConsumer, SourceMapGenerator);
    } else if (typeof define === 'function' && define.amd) {
      define(['assert', 'util', 'source-map/source-map-consumer', 'source-map/source-map-generator'], factory);
    } else {// Browser globals
      var testModule = global.testModule = global.testModule || {};
      var util = testModule['util'];
      var assert = testModule['assert'];
      var sourceMapModule = global.sourceMapModule = global.sourceMapModule || {};
      var SourceMapConsumer = sourceMapModule['source-map-consumer'];
      var SourceMapGenerator = sourceMapModule['source-map-generator'];
      testModule['test-dog-fooding'] = factory(assert, util, SourceMapConsumer, SourceMapGenerator);
    }
}(this, function (assert, util, SourceMapConsumer, SourceMapGenerator) {

  var exports = {};

  exports['test eating our own dog food'] = function () {
    var smg = new SourceMapGenerator({
      file: 'testing.js',
      sourceRoot: '/wu/tang'
    });

    smg.addMapping({
      source: 'gza.coffee',
      original: { line: 1, column: 0 },
      generated: { line: 2, column: 2 }
    });

    smg.addMapping({
      source: 'gza.coffee',
      original: { line: 2, column: 0 },
      generated: { line: 3, column: 2 }
    });

    smg.addMapping({
      source: 'gza.coffee',
      original: { line: 3, column: 0 },
      generated: { line: 4, column: 2 }
    });

    smg.addMapping({
      source: 'gza.coffee',
      original: { line: 4, column: 0 },
      generated: { line: 5, column: 2 }
    });

    var smc = new SourceMapConsumer(smg.toString());

    // Exact
    util.assertMapping(2, 2, '/wu/tang/gza.coffee', 1, 0, null, smc);
    util.assertMapping(3, 2, '/wu/tang/gza.coffee', 2, 0, null, smc);
    util.assertMapping(4, 2, '/wu/tang/gza.coffee', 3, 0, null, smc);
    util.assertMapping(5, 2, '/wu/tang/gza.coffee', 4, 0, null, smc);

    // Fuzzy
    util.assertMapping(2, 0, null, null, null, null, smc);
    util.assertMapping(2, 9, '/wu/tang/gza.coffee', 1, 0, null, smc);
    util.assertMapping(3, 0, '/wu/tang/gza.coffee', 1, 0, null, smc);
    util.assertMapping(3, 9, '/wu/tang/gza.coffee', 2, 0, null, smc);
    util.assertMapping(4, 0, '/wu/tang/gza.coffee', 2, 0, null, smc);
    util.assertMapping(4, 9, '/wu/tang/gza.coffee', 3, 0, null, smc);
    util.assertMapping(5, 0, '/wu/tang/gza.coffee', 3, 0, null, smc);
    util.assertMapping(5, 9, '/wu/tang/gza.coffee', 4, 0, null, smc);
  };

  return exports;
}));

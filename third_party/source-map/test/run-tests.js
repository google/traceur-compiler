#!/usr/bin/env node
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

function run(tests) {
  var failures = [];
  var total = 0;
  var passed = 0;

  for (var i = 0; i < tests.length; i++) {
    for (var k in tests[i].testCase) {
      if (/^test/.test(k)) {
        total++;
        try {
          tests[i].testCase[k]();
          passed++;
          process.stdout.write('.');
        }
        catch (e) {
          failures.push({
            name: tests[i].name + ': ' + k,
            error: e
          });
          process.stdout.write('E');
        }
      }
    }
  }

  process.stdout.write('\n');
  console.log(passed + ' / ' + total + ' tests passed.');

  failures.forEach(function (f) {
    console.log('================================================================================');
    console.log(f.name);
    console.log('--------------------------------------------------------------------------------');
    console.log(f.error.stack);
  });

  process.stdout.end();

  return failures.length;
}

var code;

process.stdout.on('close', function () {
  process.exit(code);
});

var requirejs = require('requirejs');

requirejs.config({
  paths: {
    'source-map': '../lib/source-map'
  },
  nodeRequire: require
});

var fs = require('fs');

function isTestFile(f) {
  return /^test\-.*?\.js/.test(f);
}

function toModule(f) {
  return './' + f.replace(/\.js$/, '');
}

var requires = fs.readdirSync(__dirname).filter(isTestFile).map(toModule);

requirejs(requires, function () {

  code = run([].slice.call(arguments).map(function (mod, i) {
    return {
      name: requires[i],
      testCase: mod
    };
  }));

});

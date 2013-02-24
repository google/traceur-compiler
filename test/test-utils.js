// Copyright 2012 Traceur Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

(function(exports) {
  function forEachPrologLine(s, f) {
    var inProlog = true;
    for (var i = 0; inProlog && i < s.length; ) {
      var j = s.indexOf('\n', i);
      if (j == -1)
        break;
      if (s[i] === '/' && s[i + 1] === '/') {
        var line = s.slice(i, j);
        f(line);
        i = j + 1;
      } else {
        inProlog = false;
      }
    }
  }

  function parseProlog(source) {
    var returnValue = {
      onlyInBrowser: false,
      skip: false,
      shouldCompile: true,
      expectedErrors: []
    };
    forEachPrologLine(source, function(line) {
      var m;
      if (line.indexOf('// Only in browser.') === 0) {
        returnValue.onlyInBrowser = true;
      } else if (line.indexOf('// Should not compile.') === 0) {
        returnValue.shouldCompile = false;
      } else if (line.indexOf('// Skip.') === 0) {
        returnValue.skip = true;
      } else if ((m = /\/\ Options:\s*(.+)/.exec(line))) {
        traceur.options.fromString(m[1]);
      } else if ((m = /\/\/ Error:\s*(.+)/.exec(line))) {
        returnValue.expectedErrors.push(m[1]);
      }
    });
    return returnValue;
  }


  function assertNoOwnProperties(o) {
    var m = Object.getOwnPropertyNames(o);
    if (m.length) {
      fail('Unexpected members found:' + m.join(', '));
    }
  }

  function assertHasOwnProperty(o) {
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < args.length; i ++) {
      var m = args[i];
      if (!o.hasOwnProperty(m)) {
        fail('Expected member ' + m + ' not found.');
      }
    }
  }

  function assertLacksOwnProperty(o) {
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < args.length; i ++) {
      var m = args[i];
      if (o.hasOwnProperty(m)) {
        fail('Unxpected member ' + m + ' found.');
      }
    }
  }

  // Replace the Closure-provided array comparer with our own that doesn't barf
  // because Array.prototype has a __iterator__ method.
  function assertArrayEquals(expected, actual) {
    assertEquals(JSON.stringify(expected, null, 2),
                 JSON.stringify(actual, null, 2));
  }

  exports.parseProlog = parseProlog;
  exports.assertNoOwnProperties = assertNoOwnProperties;
  exports.assertHasOwnProperty = assertHasOwnProperty;
  exports.assertLacksOwnProperty = assertLacksOwnProperty;
  exports.assertArrayEquals = assertArrayEquals;

})(typeof exports !== 'undefined' ? exports : this);

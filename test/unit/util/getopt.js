// Copyright 2013 Traceur Authors.
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

suite('getopt', function() {
  var Getopt;

  setup(function() {
    Getopt = Getopt || require('../../../src/node/getopt.js').Getopt;
  });

  test('invalid long options', function() {
    var g = new Getopt(['0', '1:', '2::', '0test', '1test:', '2test::']);
    var optcur;
    var argv = [
      'a', 'cmd',
      '--has.dots', '--has spaces', '--=', '--=24', '--^', '--...', '--invalid',
      '--has.dots=42', '--has spaces=42', '--^=42', '--...=42', '--invalid=42'
    ];
    while (optcur = g.optind, g.getopt(argv)) {
      assert.equal(g.opt, '?');
      assert.equal(g.optarg, null);
      assert.equal(g.optopt, argv[optcur].slice(2));
      if (/42$/.test(argv[g.optind])) {
        break;
      }
    }
    while (optcur = g.optind, g.getopt(argv)) {
      assert.equal(g.opt, '?');
      assert.equal(g.optarg, '42');
      assert.equal(g.optopt, argv[optcur].replace(/^--|=.*$/g, ''));
    }
  });
});

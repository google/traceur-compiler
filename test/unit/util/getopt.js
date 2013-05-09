suite('getopt', function() {
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

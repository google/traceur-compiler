suite('getopt', function() {
  test('invalid long options', function() {
    var g = new Getopt(['0', '1:', '2::', '0test', '1test:', '2test::']);
    var optcur;
    var argv = [
      'a', 'cmd',
      '--has.dots', '--has spaces', '--=', '--=24', '--^', '--...', '--invalid',
      '--has.dots=42', '--has spaces=42', '--^=42', '--...=42', '--invalid=42'
    ];
    var nextLoop = argv.indexOf('--has.dots=42');
    while (optcur = g.optind, g.getopt(argv)) {
      assert.equal('?', g.opt);
      assert.equal(null, g.optarg);
      assert.equal(argv[optcur].slice(2), g.optopt);
      g.opt = g.optarg = g.optopt = undefined;
      if (/42$/.test(argv[g.optind])) {
        break;
      }
    }
    while (optcur = g.optind, g.getopt(argv)) {
      assert.equal('?', g.opt);
      assert.equal('42', g.optarg);
      assert.equal(argv[optcur].replace(/^--|=.*$/g, ''), g.optopt);
      g.opt = g.optarg = g.optopt = undefined;
    }
  });
});

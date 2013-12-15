suite('RequireJsTransformer.js', function() {
  var write = traceur.outputgeneration.TreeWriter.write;
  var transformer = null

  setup(function() {
    transformer = new traceur.codegeneration.RequireJsTransformer();
  });

  suite('wrapModule', function() {
    function writeArray(arr) {
      return arr.map(write).join('');
    }

    function removeWhiteSpaces(str) {
      return str.replace(/\s/g, '');
    }

    function assertEqualIgnoringWhiteSpaces(a, b) {
      assert.equal(removeWhiteSpaces(a), removeWhiteSpaces(b));
    }

    test('with no dependencies', function() {
      assertEqualIgnoringWhiteSpaces(
          'define([], function() {"CODE";});',
          writeArray(transformer.wrapModule('CODE')));
    });

    test('with dependencies', function() {
      transformer.dependencies.push({path: './foo', local: '__dep0'});
      transformer.dependencies.push({path: './bar', local: '__dep1'});

      assertEqualIgnoringWhiteSpaces(
          'define(["./foo", "./bar"], function(__dep0, __dep1) {"CODE";});',
          writeArray(transformer.wrapModule('CODE')));
    });
  });


  suite('normalizeDependencyPath', function() {
    test('should ignore urls', function() {
      assert.equal('http://domain.com/path.js',
          transformer.normalizeDependencyPath('http://domain.com/path.js'));
      assert.equal('https://domain.com/path.js',
          transformer.normalizeDependencyPath('https://domain.com/path.js'));
    });

    test('should remove .js suffix', function() {
      assert.equal('../foo/bar',
          transformer.normalizeDependencyPath('../foo/bar.js'));
    });
  });
});

suite('AmdTransformer.js', function() {

  function get(name) {
    return $traceurRuntime.ModuleStore.getForTesting(name);
  }

  var AmdTransformer = get('src/codegeneration/AmdTransformer').AmdTransformer;
  var ParseTreeFactory = get('src/codegeneration/ParseTreeFactory');
  var write = get('src/outputgeneration/TreeWriter').write;

  var transformer = null

  setup(function() {
    transformer = new AmdTransformer();
  });

  function str(s) {
    return ParseTreeFactory.createExpressionStatement(
        ParseTreeFactory.createStringLiteral(s));
  }

  suite('wrapModule', function() {
    function writeArray(arr) {
      return arr.map(function(item) {
        return write(item);
      }).join('');
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
          writeArray(transformer.wrapModule([str('CODE')])));
    });

    test('with dependencies', function() {
      transformer.dependencies.push({path: './foo', local: '__dep0'});
      transformer.dependencies.push({path: './bar', local: '__dep1'});

      assertEqualIgnoringWhiteSpaces(
          'define(["./foo","./bar"],function(__dep0,__dep1){"CODE";});',
          writeArray(transformer.wrapModule([str('CODE')])));
    });
  });

});

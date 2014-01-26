suite('InlineModuleTransformer.js', function() {
  var ParseTreeFactory = traceur.codegeneration.ParseTreeFactory;
  var write = traceur.outputgeneration.TreeWriter.write;
  var transformer = null

  setup(function() {
    transformer = new traceur.codegeneration.InlineModuleTransformer();
  });

  function str(s) {
    return ParseTreeFactory.createExpressionStatement(
        ParseTreeFactory.createStringLiteral(s));
  }

  function removeWhiteSpaces(str) {
    return str.replace(/\s/g, '');
  }

  function assertEqualIgnoringWhiteSpaces(a, b) {
    assert.equal(removeWhiteSpaces(a), removeWhiteSpaces(b));
  }

  suite('wrapModule', function() {
    function writeArray(arr) {
      return arr.map(function(item) {
        return write(item);
      }).join('');
    }

    test('module definition', function() {
      transformer.moduleName = "test/module";
      assertEqualIgnoringWhiteSpaces(
          'var $__test_47_module__ = (function(){"CODE";}).call(this);',
          writeArray(transformer.wrapModule([str('CODE')])));
    });
  });
});

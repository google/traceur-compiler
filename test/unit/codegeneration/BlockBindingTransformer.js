suite('BlockBindingTransformer.js', function() {
  var BlockBindingTransformer = $traceurRuntime.ModuleStore.
    getForTesting('src/codegeneration/BlockBindingTransformer').BlockBindingTransformer;
  var UniqueIdentifierGenerator = $traceurRuntime.ModuleStore.
    getForTesting('src/codegeneration/UniqueIdentifierGenerator').UniqueIdentifierGenerator;
  var Parser = $traceurRuntime.ModuleStore.
    getForTesting('src/syntax/Parser').Parser;
  var SourceFile = $traceurRuntime.ModuleStore.
    getForTesting('src/syntax/SourceFile').SourceFile;
  var write = $traceurRuntime.ModuleStore.
    getForTesting('src/outputgeneration/TreeWriter').write;
  var ParseTreeValidator = $traceurRuntime.ModuleStore.
    getForTesting('src/syntax/ParseTreeValidator').ParseTreeValidator;
  var options = $traceurRuntime.ModuleStore.
    getForTesting('src/Options').options;

  var currentOption;

  setup(function() {
    currentOption = options.blockBinding;
    options.blockBinding = true;
  });

  teardown(function() {
    options.blockBinding = currentOption;
  });

  function parseExpression(content) {
    var file = new SourceFile('test', content);
    var parser = new Parser(file);
    return parser.parseExpression();
  }

  function parseFunction(content) {
    return parseExpression('function() {' + content + '}');
  }

  function normalize(content) {
    var tree = parseExpression('function() {' + content + '}').body;
    return write(tree);
  }

  function makeTest(name, code, expected) {
    test(name, function() {
      var tree = parseFunction(code);
      var transformer = new BlockBindingTransformer(new UniqueIdentifierGenerator(), null, tree);
      var transformed = transformer.transformAny(tree);
      new ParseTreeValidator().visitAny(transformed);
      assert.equal(normalize(expected), write(transformed.body));
    });
  }

  makeTest('Let to Var', 'let x;', 'var x;');
  makeTest('Let to Var In Block', '1; { 2; let x; }',
    'var x$__0; 1; { 2; }');
  makeTest('Let to Var In Block', '1; if (true) { 2; let x = 5; }',
    'var x$__0; 1; if(true) { 2; x$__0 = 5; }');


  makeTest('Let to Var In ForLoop', 'for(let i = 0; i < 5; i++);',
    'for(var i$__0 = 0; i$__0 < 5; i$__0++);');
  makeTest('Let to Var In ForLoop', 'for(let i = 0; i < 5; i++){ log(i); function t(){} }',
    'var t$__1;' +
    'for (var i$__0 = 0; i$__0 < 5; i$__0++) {' +
    '  log(i$__0);' +
    '  t$__1 = function() {};' +
    '}');


  makeTest('Let to Var In ForLoop with Fn using local var', 'for(let i = 0; i < 5; i++){ function t(){alert(i); let i = 5;} }',
    'var t$__1;' +
    'for (var i$__0 = 0; i$__0 < 5; i$__0++) {' +
    '  t$__1 = function() {alert(i); var i = 5;};' +
    '}');

  suite('Loops with Fns using block variables', function() {
    makeTest('Let to Var in',
      'for(let i = 0; i < 5; i++){ function t(){log(i)} }',
      // ======
      'var $__1 = function(i) {' +
      '  function t() {' +
      '    log(i);' +
      '  }' +
      '};' +
      'for (var i$__0 = 0; i$__0 < 5; i$__0++) {' +
        '$__1(i$__0);' +
      '}');

    makeTest('Return in Fn', 'for(let i = 0; i < 5; i++) { return function t(){return i;} }',
        'var $__1 = function(i) {' +
        '  return {v: function t() {' +
        '    return i;' +
        '  }};' +
        '}, $__2;' +
        'for (var i$__0 = 0; i$__0 < 5; i$__0++) {' +
        '  $__2 = $__1(i$__0);' +
        '  if (typeof $__2 === "object") ' +
        '    return $__2.v;' +
        '}');

    makeTest('Return nothing in Fn', 'for(let i = 0; i < 5; i++) { return; function t(){return i;} } }',
        'var $__1 = function(i) {' +
        '  return {v: (void 0)};' +
        '  function t(){return i;}' +
        '}, $__2;' +
        'for (var i$__0 = 0; i$__0 < 5; i$__0++) {' +
        '  $__2 = $__1(i$__0);' +
        '  if (typeof $__2 === "object") ' +
        '    return $__2.v;' +
        '}');

    makeTest('Break and Continue in Fn',
        'outer: while(true) {' +
        ' for(let i = 0; i < 5; i++){ ' +
        '   inner: while(true) {' +
        '     break;' +
        '     break outer;' +
        '     break inner;' +
        '     continue;' +
        '     continue outer;' +
        '     continue inner;' +
        '     function t(){return i;} }' +
        '   }' +
        ' }',
        // ======
        'outer: while (true) {' +
        '  var $__1 = function (i) {' +
        '    var t$__3;' +
        '    inner: while (true) {' +
        '      break;' +
        '      return 0;' +
        '      break inner;' +
        '      continue;' +
        '      return 1;' +
        '      continue inner;' +
        '      t$__3 = function () {' +
        '        return i;' +
        '      };' +
        '    }' +
        '  }, $__2;' +
        '  for (var i$__0 = 0; i$__0 < 5; i$__0++) {' +
        '    $__2 = $__1(i$__0);' +
        '    switch ($__2) {' +
        '      case 0:' +
        '        break outer;' +
        '      case 1:' +
        '        continue outer;' +
        '    }' +
        '  }' +
        '}');

    makeTest('This and Arguments',
        'for(let i = 0; i < 5; i++){ console.log(this, arguments); function t(){log(i)} }',
        // ======
        'var $__1 = arguments,' +
        '    $__2 = this,' +
        '    $__3 = function(i) { console.log($__2, $__1); function t() {log(i)} };' +
        'for (var i$__0 = 0; i$__0 < 5; i$__0++) {' +
        '$__3(i$__0);' +
        '}');

    makeTest('Hoist Var Declaration',
        'for(let i = 0; i < 5; i++){ var k = 1; function t(){log(i)} }',
        // ======
        'var k, $__1 = function(i) {' +
        '  k = 1;' +
        '  function t() {' +
        '    log(i);' +
        '  }' +
        '};' +
        'for (var i$__0 = 0; i$__0 < 5; i$__0++) {' +
        '$__1(i$__0);' +
        '}');
  })
});
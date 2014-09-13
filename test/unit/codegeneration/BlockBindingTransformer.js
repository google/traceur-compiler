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
  var ErrorReporter = $traceurRuntime.ModuleStore.
      getForTesting('src/util/CollectingErrorReporter').CollectingErrorReporter;

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
      var reporter = new ErrorReporter();
      var transformer = new BlockBindingTransformer(
          new UniqueIdentifierGenerator(), reporter, tree);
      var transformed = transformer.transformAny(tree);
      new ParseTreeValidator().visitAny(transformed);
      assert.equal(normalize(expected), write(transformed.body));
      assert.lengthOf(reporter.errors, 0);
    });
  }

  makeTest('Let to Var', 'let x;', 'var x;');
  makeTest('Let to Var In Block', '1; { 2; let x; }',
    'var x; 1; { 2; }');
  makeTest('Let to Var In Block', '1; if (true) { 2; let x = 5; }',
    'var x; 1; if(true) { 2; x = 5; }');


  makeTest('Let to Var In ForLoop', 'for(let i = 0; i < 5; i++);',
    'for(var i = 0; i < 5; i++);');
  makeTest('Let to Var In ForLoop', 'for(let i = 0; i < 5; i++){ log(i); function t(){} }',
    'var t;' +
    'for (var i = 0; i < 5; i++) {' +
    '  t = function() {};' +
    '  log(i);' +
    '}');


  makeTest('Let to Var In ForLoop with Fn using local var', 'for(let i = 0; i < 5; i++){ function t(){alert(i); let i = 5;} }',
    'var t;' +
    'for (var i = 0; i < 5; i++) {' +
    '  t = function() {alert(i); var i = 5;};' +
    '}');


  makeTest('Let to Var with name collisions', 'if(true){let x = 5;} if(true){let x = 5;}',
    'var x;' +
    'var x$__0;' +
    'if (true) {' +
    '  x = 5;' +
    '}' +
    'if (true) {' +
    '  x$__0 = 5;' +
    '}');

  suite('Loops with Fns using block variables', function() {
    makeTest('Let to Var in',
      'for(let i = 0; i < 5; i++){ function t(){log(i)} }',
      // ======
      'var $__0 = function(i) {' +
      '  function t() {' +
      '    log(i);' +
      '  }' +
      '};' +
      'for (var i = 0; i < 5; i++) {' +
        '$__0(i);' +
      '}');

    makeTest('Return in Fn', 'for(let i = 0; i < 5; i++) { return function t(){return i;} }',
        'var $__0 = function(i) {' +
        '  return {v: function t() {' +
        '    return i;' +
        '  }};' +
        '}, $__1;' +
        'for (var i = 0; i < 5; i++) {' +
        '  $__1 = $__0(i);' +
        '  if (typeof $__1 === "object") ' +
        '    return $__1.v;' +
        '}');

    makeTest('Return nothing in Fn', 'for(let i = 0; i < 5; i++) { return; function t(){return i;} } }',
        'var $__0 = function(i) {' +
        '  return {v: (void 0)};' +
        '  function t(){return i;}' +
        '}, $__1;' +
        'for (var i = 0; i < 5; i++) {' +
        '  $__1 = $__0(i);' +
        '  if (typeof $__1 === "object") ' +
        '    return $__1.v;' +
        '}');

    makeTest('Break and Continue in Fn',
        '"use strict";' +
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
        '"use strict";' +
        'outer: while (true) {' +
        '  var $__0 = function (i) {' +
        '    var t;' +
        '    inner: while (true) {' +
        '      t = function () {' +
        '        return i;' +
        '      };' +
        '      break;' +
        '      return 0;' +
        '      break inner;' +
        '      continue;' +
        '      return 1;' +
        '      continue inner;' +
        '    }' +
        '  }, $__1;' +
        '  for (var i = 0; i < 5; i++) {' +
        '    $__1 = $__0(i);' +
        '    switch ($__1) {' +
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
        'var $__0 = arguments,' +
        '    $__1 = this,' +
        '    $__2 = function(i) { console.log($__1, $__0); function t() {log(i)} };' +
        'for (var i = 0; i < 5; i++) {' +
        '$__2(i);' +
        '}');

    makeTest('Hoist Var Declaration',
        'for(let i = 0; i < 5; i++){ var k = 1; function t(){log(i)} }',
        // ======
        'var k, $__0 = function(i) {' +
        '  k = 1;' +
        '  function t() {' +
        '    log(i);' +
        '  }' +
        '};' +
        'for (var i = 0; i < 5; i++) {' +
        '$__0(i);' +
        '}');

    makeTest('Function as Block Binding',
        'for(let i = 0; i < 5; i++){ function k() {} function t(){log(k)} }',
        // ======
        'var $__0 = function(i) {' +
        '  function k() {}' +
        '  function t() {' +
        '    log(k);' +
        '  }' +
        '};' +
        'for (var i = 0; i < 5; i++) {' +
        '$__0(i);' +
        '}');

    makeTest('Loop with Var initializer remains untouched',
        'for(var i = 0; i < 5; i++){ let x = 10; function t() {console.log(x)} }',
        // ======
        'var $__0 = function() {' +
        '  var x = 10;' +
        '  function t() {' +
        '    console.log(x);' +
        '  }' +
        '};' +
        'for (var i = 0; i < 5; i++) {' +
        '  $__0();' +
        '}');
  });

  suite('Hoisting', function () {
    makeTest('Function hoist in block',
        'if (true) { f(); function f() { other() } }',
        // ======
        'var f$__0;' +
        'if (true) {' +
        '  f$__0 = function() {' +
        '    other();' +
        '  };' +
        'f$__0();' +
        '}');

    makeTest('Function are untouched when outside block',
        'f(); function f() { other() }',
        'f(); function f() { other() }');
  });
});
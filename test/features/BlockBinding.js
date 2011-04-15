// Block binding (let) test

// Simple cases

function topLevelLet() {
  let x = 'let';
}

function topLevelLetVar() {
  let x = 'let';
  var y = 'var';
}

function topLevelLetConst() {
  let x = 'let';
  const y = 'const';
}

function nestedLet() {
  var x = 'var';
  {
    let y = 'let 1';
  }
  {
    let y = 'let 2';
  }
}

function deepNestedLet() {
  var a = 'var a';
  {
    var b = 'var b';
    {
      var c = 'var c';
      let d = 'let d';
    }
  }
}

function deepNestedLetVar() {
  var a = 'var a';
  {
    var b = 'var b';
    {
      let c = 'let c';
      {
        var d = 'var d';
      }
    }
  }
}

function deepNestedLetConst() {
  var a = 'var a';
  {
    var b = 'var b';
    {
      let c = 'let c';
      {
        const d = 'const d';
      }
    }
  }
}

function deepNestedLetVarNoInit() {
  var var_a;
  {
    var var_b;
    {
      let let_c = 'let c';
      {
        var var_d;
      }
    }
  }
}

function letInFor() {
  for (var x = 0; x < 10; x ++) {
    let y = 'let y';
  }
}

function letInForBreak() {
  for (var x = 0; x < 10; x ++) {
    let y = 'let y';
    if (x % 2 == 0) {
      break;
    }
  }
}

function letInForContinue() {
  for (var x = 0; x < 10; x ++) {
    let y = 'let y';
    if (x % 2 == 0) {
      continue;
    }
  }
}

function letInForBreakInner() {
  for (var x = 0; x < 10; x ++) {
    for (var y = 0; y < 10; y ++) {
      let z = 'let z';
      if (x == 7) {
        break;
      }
    }
  }
}

function letInForContinueInner() {
  for (var x = 0; x < 10; x ++) {
    for (var y = 0; y < 10; y ++) {
      let z = 'let z';
      if (x == 7) {
        continue;
      }
    }
  }
}

function letInForBreakNamed() {
  outer:
  for (var x = 0; x < 10; x ++) {
    for (var y = 0; y < 10; y ++) {
      let z = 'let z';
      if (x == 7) {
        break outer;
      }
    }
  }
}

function letInForContinueNamed() {
  outer:
  for (var x = 0; x < 10; x ++) {
    for (var y = 0; y < 10; y ++) {
      let z = 'let z';
      if (x == 7) {
        continue outer;
      }
    }
  }
}

function letWithFor() {
  for (var x = 0; x < 10; x++) {
    let let_y = 'let y';
    for (var for_z = 0; for_z < 2; for_z ++) {
      break;
    }
  }
}

function letWithForIn() {
  for (var x in [1,2,3]) {
    let let_y = x;
    for (var for_in_z in [4,5,6]) {
      continue;
    }
  }
}

function letWithSwitch() {
  for (var i = 0; i < 5; i ++) {
    let let_x = 'let x';

    switch (i) {
      case 0:
        break;
      case 2:
        break;
      default:
        break;
    }
  }
}

function letWithSwitch2() {
  for (var i = 0; i < 5; i ++) {
    let let_x = 'let x';

    switch (i) {
      case 0:
        continue;
      case 2:
        break;
      default:
        break;
    }
  }
}

function nestedFunction1() {
  return function() {
    let let_x = 'let x';
  }
}

function nestedFunction2() {
  let let_func = function() {
    let let_x = 'let x';
  }
  return let_func;
}

function nestedFunction3() {
  let let_x = 'let x';
  function function_foo() { }
}

function letInProperties() {
  var object = {
    get x() {
      while (true) {
        let let_x = 'let x';
        return let_x;
      }
    },

    set x(v) {
      do {
        let let_v = v;
        this.v = let_v;
      } while (false);
    }
  }
}

class letInClass {
  x, y;

  get z() {
    let let_z = 10;
    return let_z;
  }

  set z(v) {
    let let_zv = v;
  }

  function distance() {
    let dist = this.y - this.x;
    return dist;
  }
}

function letInClosure(n) {
  l = []
  for (var i = 0; i < n; i ++) {
    let let_i = i;
    if (i % 3 == 0) {
      continue;
    }
    l.push( function() { return let_i; } )
  }
  return l;
}

// Test multiple initializations in for loop
function letForInitializers1() {
  var result;
  {
    let let_x = 'let x';
    let let_l = [];
    for (var var_x = 1, var_y = 2, var_z = 3; var_x < 10; var_x ++) {
       let l_x = var_x, l_y = var_y, l_z = var_z;
       let_l.push( function() { return [ l_x, l_y, l_z ]; } );
    }
    result = let_l;
  }
  return result;
}

// Test initializations in for..in loop
function letForInitializers1() {
  var result;
  {
    let let_result = [];
    let let_array = ['one', 'two', 'three'];
    for (var index = 1 in let_array) {
      let let_index = index;
      let let_value = let_array[let_index];
      let_result.push(
          function() {
            return [let_ott, let_index, let_value];
          });
    }
    result = let_result;
  }
  return result;
}

function letInitializerForIn() {
  let sum = 0;
  let a = [1,2,3];
  for (let x in a) {
    sum = sum + a[x];
  }
  return x;
}

let global_let = 'global let';
const global_const = 'global const';

{
  let in_block_let = 'in block let';
  const in_block_const = 'in block const';
  var in_block_var = 'in block var';
}

function deconstructingBlockBinding() {
  if (true) {
    let [a,b] = [1,2];
    const [c,d] = [4,5];
  }
  if (true) {
    let {x: [{e}, f], g} = {x: [{e:4}, 5], g: 6};
    const a = 0, [b, {c, x: [d]}] = [1, {c: 2, x: [3]}];
  }
}

function letInitializerFor1() {
  for (let x = 1; x < 10; x ++) {
    print(x);
  }
}

function letInitializerFor2() {
  for (let x = 1, y = 2, z = 3; x < 10; x ++) {
    y ++;
    z ++;
  }
}

function letInitializerFor3() {
  for (let x = 1, y = x + 1; x < 10 && y != 0; x ++, y *= 2) {
    if (y > 300) {
      continue;
    }
  }
}

function blockBindingTest1() {
  let result = [];
  let obj = {a : 'hello a', b : 'hello b', c : 'hello c' };
  for (let x in obj) {
    result.push(
      function() { return obj[x]; }
    );
  }
  return result;
}

function blockBindingTest2() {
  {
    let z = 'z value';
  }

  try {
    var x = z;
  } catch (e) {
    return 'blockBindingTest2_PASS';
  }
  return 'blockBindingTest2_FAIL';
}

function blockBindingTest3() {
  var f1, f2;

  {
    let z = 'z1 value';
    f1 = function() { return z; }
  }
  {
    let z = 'z2 value';
    f2 = function() { return z; }
  }

  return [f1, f2];
}

function blockBindingTest4() {
  let result = [];
  for (let a = 1; a < 3; a++) {
    result.push(
      function() { return 'for ' + a; }
    );
  }
  return result;
}

function blockBindingTest5() {
  let result = []; 
  for (let i = 1; i < 3; i ++) {
    for (let j = 9; j > 7; j --) {
      result.push(
        function() { return i + ':' + j; }
      );
    }
  }
  return result;
}


function blockBindingTest6() {
  // test function expressions
  {
    var x = function g() { return 'g'; } || function h() { return 'h'; };
    return x;
  }
}

function blockBindingTest7() {
  {
    let x = 'let x value';
    function g() {
      return x;
    }
    return g;
  }
}


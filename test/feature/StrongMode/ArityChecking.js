// Options: --strong-mode --strong-mode-asserts

function f(x) {}
f();

function f0() { 'use strong'; }
f0();
f0(1);

function f1(x) { 'use strong'; }
assert.throws(f1, TypeError);
f1(1);
f1(1, 2);

function f2(x = 1) { 'use strong'; }
f2();
f2(1);
f2(1, 2);

function f3(...xs) { 'use strong'; }
f3();

function f4(x, y = 1) { 'use strong'; }
f4(1);

function f5(x, ...xs) { 'use strong'; }
f5(1);

function f6(x = 1, y) { 'use strong'; }
assert.throws(f6, TypeError);
assert.throws(() => f6(2), TypeError);
f6(1, 2);

function f7(x, y = 1, z) { 'use strong'; }
assert.throws(f7, TypeError);
assert.throws(() => f7(1), TypeError);
assert.throws(() => f7(1, 2), TypeError);
f7(1, 2, 3);
f7(1, 2, 3, 4);

function f8({x} = {x :1}) { 'use strong'; }
f8();
f8(1);

function f9({x}) { 'use strong'; }
assert.throws(f9, TypeError);
f9({x: 1});

let f10 = function(x) { 'use strong'; }
assert.throws(f10, TypeError);
f10(1);

assert.throws(() => f10.call(null), TypeError);
assert.throws(() => f10.apply(null, []), TypeError);
f10.call(null, 1);
f10.apply(null, [1]);

(() => {
  'use strong';
  function f0() {}
  f0();
  f0(1);

  function f1(x) {}
  assert.throws(f1, TypeError);
  f1(1);
  f1(1, 2);

  function f2(x = 1) {}
  f2();
  f2(1);
  f2(1, 2);

  function f3(...xs) {}
  f3();

  function f4(x, y = 1) {}
  f4(1);

  function f5(x, ...xs) {}
  f5(1);

  function f6(x = 1, y) {}
  assert.throws(f6, TypeError);
  assert.throws(() => f6(2), TypeError);
  f6(1, 2);

  function f7(x, y = 1, z) {}
  assert.throws(f7, TypeError);
  assert.throws(() => f7(1), TypeError);
  assert.throws(() => f7(1, 2), TypeError);
  f7(1, 2, 3);
  f7(1, 2, 3, 4);

  function f8({x} = {x :1}) {}
  f8();
  f8(1);

  function f9({x}) {}
  assert.throws(f9, TypeError);
  f9({x: 1});

  let f10 = function(x) {}
  assert.throws(f10, TypeError);
  f10(1);
})();

class C {
  m(x) { 'use strong'; }
  set x(_) { 'use strong'; }
}

assert.throws(() => new C().m(), TypeError);
new C().m(1);

let descr = Object.getOwnPropertyDescriptor(C.prototype, 'x');
assert.throws(() => {
  descr.set();
}, TypeError);
descr.set(1);

(() => {
  class C {
    m(x) { 'use strong'; }
    set x(_) { 'use strong'; }
  }

  assert.throws(() => new C().m(), TypeError);
  new C().m(1);

  let descr = Object.getOwnPropertyDescriptor(C.prototype, 'x');
  assert.throws(() => {
    descr.set();
  }, TypeError);
  descr.set(1);
})();

// Cannot verify arrow functions because arrow functions have no arguments
// object.

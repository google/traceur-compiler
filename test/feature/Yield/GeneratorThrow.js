function assertThrownEquals(x, fn) {
  assertEquals(x, assertThrows(fn));
}

function assertThrownErrorIs(str, fn) {
  var e = assertThrows(fn);
  if (!e instanceof Error)
    fail('expected Error object');

  assertEquals(str, e.message);
}

import {isStopIteration} from '@iter';

function assertThrowsStopIteration(fn) {
  if (!isStopIteration(assertThrows(fn)))
    fail('[object StopIteration] expected');
}

function assertClosed(g) {
  assertThrownErrorIs('"send" on closed generator', () => g.next());
}

//-----------------------------------------------------------------------------

function id(G) {
  return G;
}

function wrap(G) {
  return function* () {
    yield* G();
  };
}

[id, wrap].forEach((W) => { // wrap_forEach

//-----------------------------------------------------------------------------
//
// http://wiki.ecmascript.org/doku.php?id=harmony:generators
//
// G.[[Throw]]
//
//     Let State = G.[[State]]
//     If State = “executing” Throw Error
//     If State = “closed” Throw Error
//     Let X be the first argument
//     If State = “newborn”
//         G.[[State]] := “closed”
//         G.[[Code]] := null
//         Return (throw, X, null)
//     G.[[State]] := “executing”
//     Let Result = Resume(G.[[ExecutionContext]], throw, X)
//     Return Result

var g;

//-----------------------------------------------------------------------------
//
//     If State = “executing” Throw Error

function* G1() {
  yield g.throw();
}
g = W(G1)();
assertThrownErrorIs('"throw" on executing generator', () => g.next());

//-----------------------------------------------------------------------------
//
//     If State = “closed” Throw Error

function* G2() {
  try {
    yield 1;
    yield 2;
  } catch(e) {
    yield '(' + e + ')';
  }
  yield 3;
}

// - calling throw() on a closed generator should throw an Error.
// - calling throw() on an ended generator should throw an Error.
//   (this is the same as closed, really)

var closeMethods = [
  (g) => g.close(),
  (g) => {
    assertArrayEquals([1, '(22)', 3], [g.next(), g.throw(22), g.next()]);
    assertThrownEquals(42, () => g.throw(42));
  },
  (g) => {
    assertArrayEquals([1, 2, 3], [g.next(), g.next(), g.next()]);
    assertThrowsStopIteration(() => g.next());
  }
];

closeMethods.forEach((closeMethod) => {
  g = W(G2)();
  closeMethod(g);
  for (var i = 0; i < 8; i++) {
    assertThrownErrorIs('"throw" on closed generator', () => g.throw(44));
  }
});

//-----------------------------------------------------------------------------
//
//     Let X be the first argument
//     If State = “newborn”
//         G.[[State]] := “closed”
//         G.[[Code]] := null
//         Return (throw, X, null)

g = W(G2)();

// calling throw(x) on a newborn generator should close the generator, and
// throw x back to the caller.
assertThrownEquals(44, () => g.throw(44));
assertClosed(g);

//-----------------------------------------------------------------------------
//
//     G.[[State]] := “executing”
//     Let Result = Resume(G.[[ExecutionContext]], throw, X)
//     Return Result

g = W(G2)();

// calling throw(x) on a started generator should be the same as hot-replacing
// the last 'yield' with a 'throw x' and calling next() on that generator. So
// it could either throw an exception, or return a value, depending on the
// flow of control.
assertEquals(1, g.next());
assertEquals('(22)', g.throw(22));
assertEquals(3, g.next());

assertThrownEquals(44, () => g.throw(44));
assertClosed(g);

//----

function* G3() {
  try{
    yield 1;
    yield 2;
    yield 3;
  } catch(e) {}
}

g = W(G3)();

// Note: this behavior differs from ionmonkey, which throws 'undefined', and
// not StopIteration, but the StopIteration behavior better matches what I'd
// expect, given the description from the previous test.
assertEquals(1, g.next());
assertThrowsStopIteration(() => g.throw(44));
assertClosed(g);

}); // end wrap_forEach

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
  var e = assertThrows(fn);
  if (!isStopIteration(e))
    fail('[object StopIteration] expected');
  return e;
}

function assertClosed(g) {
  assertThrownErrorIs('"send" on closed generator', () => g.next());
}

function assertThrownReturnEquals(x, f) {
  var e = assertThrowsStopIteration(f);
  assertEquals(x, e.value);
}

//-----------------------------------------------------------------------------

var g;

function* G1() {
  return 42;
}

function* G2() {
  return;
}

function* G3() {
  return undefined;
}

function* G4() {
  return 42;
  yield 1000;
}

function* G5() {
  yield 1000;
  return 42;
}

function* G6() {
  try {
    yield 1000;
    return 42;
    yield 2000;
  } catch(e) {
    return 43;
  } finally {
    // TODO: Is 'return' allowed inside 'finally'?
    // return 44;
  }
}

//----

function id(G) {
  return G;
}

function wrap(G) {
  return function*() {
    var r = yield* G();
    return r;
  };
}

//----

var tests = [
  [G1, [], 42],
  [G2, [], undefined],
  [G3, [], undefined],
  [G4, [], 42],
  [G5, [1000], 42],
  [G6, [1000], 42]
];

//-----------------------------------------------------------------------------

[id, wrap].forEach((W) => {

  tests.forEach(([G, y, r]) => {
    var g = W(G)();
    y.forEach((x) => assertEquals(x, g.next()));

    assertThrownReturnEquals(r, () => g.next());
    assertClosed(g);
  });

  //----

  g = W(G6)();
  assertEquals(1000, g.next());
  assertThrownReturnEquals(43, () => g.throw());

});

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
// The close method terminates a suspended generator. This informs the
// generator to resume roughly as if via return, running any active finally
// blocks first before completing.
//
// G.[[Close]]
//
//     Let State = G.[[State]]
//     If State = “executing” Throw Error
//     If State = “closed” Return undefined
//     If State = “newborn”
//         G.[[State]] := “closed”
//         G.[[Code]] := null
//         Return (normal, undefined, null)
//     G.[[State]] := “executing”
//     Let Result = Resume(G.[[ExecutionContext]], return, undefined)
//     G.[[State]] := “closed”
//     Return Result

var g;

//-----------------------------------------------------------------------------
//
//     If State = “executing” Throw Error

function* G1() {
  yield g.close();
}

g = W(G1)();
assertThrownErrorIs('"close" on executing generator', () => g.next());

//-----------------------------------------------------------------------------
//
//     If State = “closed” Return undefined

function* G2() {
  yield 1;
}

var closeMethods = [
  (g) => g.close(),
  (g) => {
    assertEquals(1, g.next());
    g.close();
  },
  (g) => {
    assertEquals(1, g.next());
    assertThrownEquals(42, () => g.throw(42));
  },
  (g) => {
    assertEquals(1, g.next());
    assertThrowsStopIteration(() => g.next());
  }
];

closeMethods.forEach((closeMethod) => {
  g = W(G2)();
  closeMethod(g);
  for (var i = 0; i < 8; i++) {
    assertEquals(undefined, g.close());
  }
});

//-----------------------------------------------------------------------------
//
//     If State = “newborn”
//         G.[[State]] := “closed”
//         G.[[Code]] := null
//         Return (normal, undefined, null)

var value = 'unmodified';
var finallyAction = 'return';

function* G3() {
  try {
    yield 10;
    yield 11;
  } catch (e) {
    if (e < 10) {
      yield 20 + e;
    } else {
      throw 200 + e;
    }
  } finally {
    value = 'finally run';
    switch (finallyAction) {
      case 'throw':
        throw 'throw requested';
      case 'return':
        break;
    }
  }
}

// close() on a newborn generator should end it without running any code.
g = W(G3)();
value = 'unmodified';

g.close();
assertEquals('unmodified', value);
assertClosed(g);

//-----------------------------------------------------------------------------
//
//     G.[[State]] := “executing”
//     Let Result = Resume(G.[[ExecutionContext]], return, undefined)
//     G.[[State]] := “closed”
//     Return Result

// close() on a started generator should end it after running the finally
// block.
g = W(G3)();
value = 'unmodified';

assertEquals(10, g.next());
assertEquals('unmodified', value);
assertNotThrows(() => g.close());
assertEquals('finally run', value);
assertClosed(g);


//----

g = W(G3)();
value = 'unmodified';

assertEquals(10, g.next());
assertEquals('unmodified', value);
assertEquals(22, g.throw(2));
assertEquals('unmodified', value);
assertNotThrows(() => g.close());
assertEquals('finally run', value);
assertClosed(g);

//----

// close() on a started generator may cause a throw in the finally block.
g = W(G3)();
value = 'unmodified';
finallyAction = 'throw';

assertEquals(10, g.next());
assertEquals('unmodified', value);
assertThrownEquals('throw requested', () => g.close());
assertEquals('finally run', value);
assertClosed(g);

//----

g = W(G3)();
value = 'unmodified';
finallyAction = 'throw';

assertEquals(10, g.next());
assertEquals('unmodified', value);
assertEquals(22, g.throw(2));
assertEquals('unmodified', value);
assertThrownEquals('throw requested', () => g.close());
assertEquals('finally run', value);
assertClosed(g);

}); // end wrap_forEach

function assertThrownEquals(x, func) {
  assertEquals(x, assertThrows(func));
}

function assertThrownErrorIs(str, func) {
  var e = assertThrows(func);
  assertTrue(e instanceof Error);

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
// G.[[Send]]
//
//     Let State = G.[[State]]
//     If State = “executing” Throw Error
//     If State = “closed” Throw Error
//     Let X be the first argument
//     If State = “newborn”
//         If X != undefined Throw TypeError
//         Let K = a new execution context as for a function call
//         K.currentGenerator := G
//         K.scopeChain := G.[[Scope]]
//         Push K onto the stack
//         Return Execute(G.[[Code]])
//     G.[[State]] := “executing”
//     Let Result = Resume(G.[[ExecutionContext]], normal, X)
//     Return Result

var g;

//-----------------------------------------------------------------------------
//
//     If State = “executing” Throw Error

function* G1() {
  yield g.next();
}

g = W(G1)();
// To be nitpicky, ionmonkey throws TypeError, and not Error. I'm not checking
// things quite that closely at this point in time.
assertThrownErrorIs('"send" on executing generator', () => g.next());

//-----------------------------------------------------------------------------
//
//     If State = “closed” Throw Error

// Note: ionmonkey continues to throw StopIteration for every 'next' on a
// closed generator, while harmony:generators seems to favor throwing it once
// only, at the point of generator exit, and throwing Error for all the
// following 'next' calls.

function* G2() {
  yield 1;
}

var closeMethods = [
  (g) => g.close(),
  (g) => assertThrownEquals(42, () => g.throw(42)),
  (g) => {
    assertEquals(1, g.next());
    assertThrowsStopIteration(() => g.next());
  }
];

closeMethods.forEach((closeMethod) => {
  g = W(G2)();
  closeMethod(g);
  for (var i = 0; i < 8; i++) {
    assertThrownErrorIs('"send" on closed generator', () => g.next());
  }
});

//-----------------------------------------------------------------------------
//
//     If State = “newborn”
//         If X != undefined Throw TypeError

g = W(G2)();
for (var i = 0; i < 8; i++) {
  assertThrownErrorIs('Sent value to newborn generator', () => g.send(42));
}

assertNotThrows(() => assertEquals(1, g.send(undefined)));

//-----------------------------------------------------------------------------
//
//         Let K = a new execution context as for a function call
//         K.currentGenerator := G
//         K.scopeChain := G.[[Scope]]
//         Push K onto the stack
//         Return Execute(G.[[Code]])

// (see below)

//-----------------------------------------------------------------------------
//
//     G.[[State]] := “executing”
//     Let Result = Resume(G.[[ExecutionContext]], normal, X)
//     Return Result

// (see below)

//-----------------------------------------------------------------------------

// Example adapted from:
// https://developer.mozilla.org/en-US/docs/JavaScript/Guide/Iterators_and_Generators
function* fib() {
  var fn1 = 1;
  var fn2 = 1;
  var reset;
  while (1) {
    var current = fn2;
    fn2 = fn1;
    fn1 = fn1 + current;
    reset = yield current;
    if (reset) {
      fn1 = 1;
      fn2 = 1;
    }
  }
}

// var
function* fibVar() {
  var fn1 = 1;
  var fn2 = 1;
  while (1) {
    var current = fn2;
    fn2 = fn1;
    fn1 = fn1 + current;
    var reset = yield current;
    if (reset) {
      fn1 = 1;
      fn2 = 1;
    }
  }
}

// destructuring
function* fibD() {
  var fn1 = 1;
  var fn2 = 1;
  var reset;
  var tmp;
  while (1) {
    var current = fn2;
    fn2 = fn1;
    fn1 = fn1 + current;
    [reset, tmp] = yield current;
    assertEquals(reset, tmp);
    if (reset) {
      fn1 = 1;
      fn2 = 1;
    }
  }
}

// destructuring with var
function* fibVarD() {
  var fn1 = 1;
  var fn2 = 1;
  var tmp;
  while (1) {
    var current = fn2;
    fn2 = fn1;
    fn1 = fn1 + current;
    var [reset, tmp] = yield current;
    assertEquals(reset, tmp);
    if (reset) {
      fn1 = 1;
      fn2 = 1;
    }
  }
}

function next(g) {
  return g.next();
}

function send(g, v) {
  return g.send(v);
}

function nextD(g) {
  return g.send([]);
}

function sendD(g, v) {
  return g.send([v, v]);
}

function testfib(fibonacci, next, send) {
  var sequence = fibonacci();
  assertEquals(1, sequence.next());
  assertEquals(1, next(sequence));
  assertEquals(2, next(sequence));
  assertEquals(3, next(sequence));
  assertEquals(5, next(sequence));
  assertEquals(8, next(sequence));
  assertEquals(13, next(sequence));
  assertEquals(1, send(sequence, true));
  assertEquals(1, next(sequence));
  assertEquals(2, next(sequence));
  assertEquals(3, next(sequence));
}

//----

testfib(W(fib), next, send);
testfib(W(fibVar), next, send);
testfib(W(fibD), nextD, sendD);
testfib(W(fibVarD), nextD, sendD);

}); // end wrap_forEach

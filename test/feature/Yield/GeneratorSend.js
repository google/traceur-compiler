function assertThrownEquals(x, func) {
  var actualError;
  try {
    func();
  } catch (err) {
    actualError = err;
  }
  assert.equal(x, actualError);
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
assert.throw(() => g.next(), '"next" on executing generator');

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
  (g) => assertThrownEquals(42, () => g.throw(42)),
  (g) => {
    assert.deepEqual({value: 1, done: false}, g.next());
    assert.deepEqual({value: undefined, done: true}, g.next());
  }
];

closeMethods.forEach((closeMethod) => {
  g = W(G2)();
  closeMethod(g);
  for (var i = 0; i < 8; i++) {
    assert.throw(() => g.next(), '"next" on closed generator');
  }
});

//-----------------------------------------------------------------------------
//
//     If State = “newborn”
//         If X != undefined Throw TypeError

g = W(G2)();
for (var i = 0; i < 8; i++) {
  assert.throw(() => g.next(42), 'Sent value to newborn generator');
}

assert.deepEqual({value: 1, done: false}, g.next(undefined));


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
    assert.equal(reset, tmp);
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
    assert.equal(reset, tmp);
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
  return g.next(v);
}

function nextD(g) {
  return g.next([]);
}

function sendD(g, v) {
  return g.next([v, v]);
}

function testfib(fibonacci, next, send) {
  var sequence = fibonacci();
  assert.deepEqual({value: 1, done: false}, sequence.next());
  assert.deepEqual({value: 1, done: false}, next(sequence));
  assert.deepEqual({value: 2, done: false}, next(sequence));
  assert.deepEqual({value: 3, done: false}, next(sequence));
  assert.deepEqual({value: 5, done: false}, next(sequence));
  assert.deepEqual({value: 8, done: false}, next(sequence));
  assert.deepEqual({value: 13, done: false}, next(sequence));
  assert.deepEqual({value: 1, done: false}, send(sequence, true));
  assert.deepEqual({value: 1, done: false}, next(sequence));
  assert.deepEqual({value: 2, done: false}, next(sequence));
  assert.deepEqual({value: 3, done: false}, next(sequence));
}

//----

testfib(W(fib), next, send);
testfib(W(fibVar), next, send);
testfib(W(fibD), nextD, sendD);
testfib(W(fibVarD), nextD, sendD);

}); // end wrap_forEach

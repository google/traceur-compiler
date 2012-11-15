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
  g.moveNext();
  return g.current;
}

function send(g, v) {
  g.moveNext(v);
  return g.current;
}

function nextD(g) {
  g.moveNext([]);
  return g.current;
}

function sendD(g, v) {
  g.moveNext([v, v]);
  return g.current;
}

function testfib(fibonacci, next, send) {
  var sequence = fibonacci();
  assertEquals(1, next(sequence));
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

testfib(fib, next, send);
testfib(fibVar, next, send);
testfib(fibD, nextD, sendD);
testfib(fibVarD, nextD, sendD);

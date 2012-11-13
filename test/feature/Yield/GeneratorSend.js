// Example adapted from:
// https://developer.mozilla.org/en-US/docs/JavaScript/Guide/Iterators_and_Generators
function* fibonacci() {
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

function next(g) {
  g.moveNext();
  return g.current;
}

function send(g, v) {
  g.moveNext(v);
  return g.current;
}

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

// Options: --unstarredGenerators

function isStopIteration(s) {
  // Maybe something more rigorous later.
  return typeof s === 'object' && String(s) === '[object StopIteration]';
}

function assertThrowsStopIteration(fn) {
  if (!isStopIteration(assertThrows(fn)))
    fail('[object StopIteration] expected');
}

//-----------------------------------------------------------------------------

function G() {
  yield 42;
}

var g = G();

assertEquals(42, g.next());
assertThrowsStopIteration(() => g.next());

// Options: --proper-tail-calls

Error.stackTraceLimit = Infinity;

var stackSize;
function recordStackSize() {
  try {
    Error.prepareStackTrace = function(error, structuredStackTrace) {
      return structuredStackTrace.length;
    }
    stackSize = new Error().stack;
  } finally {
    delete Error.prepareStackTrace;
  }
}

function assertProperTailCalls(limit = 30) {
  assert.isTrue(stackSize < limit);
}

function Value(n, m) {
  assert.instanceOf(this, Value);
  if (n === 0) {
    recordStackSize();
    this.m = m;
  } else {
    return new Value(n - 1, n + m);
  }
}

function f(n) {
  return new Value(n, 0);
}

function sum(n) {
  return n * (n + 1) / 2;
}

assert.equal(f(50).m, sum(50));
assertProperTailCalls();

class C {
  constructor(n) {
    this.x = n;
  }
}

function g(n) {
  return new C(n);
}

assert.equal(g(42).x, 42);

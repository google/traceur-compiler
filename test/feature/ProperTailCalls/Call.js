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

function g(n, m) {
  if (n === 0) {
    recordStackSize();
  }
  return n === 0 ? m : g.call(null, n - 1, n + m);
}

function f(n) {
  return g(n, 0);
}

function sum(n) {
  return n * (n + 1) / 2;
}

assert.equal(f(50), sum(50));
assertProperTailCalls();

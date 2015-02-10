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

function g1(n, m) {
  if (n === 0) {
    recordStackSize();
  }
  return n === 0 ? m : g2(n - 1, n + m);
}

function g2(n, m) {
  if (n === 0) {
    recordStackSize();
  }
  return n === 0 ? m : g1(n - 1, n + m);
}

function f(n) {
  return g1(n, 0);
}

function sum(n) {
  return n * (n + 1) / 2;
}

assert.equal(f(50), sum(50));
assertProperTailCalls();

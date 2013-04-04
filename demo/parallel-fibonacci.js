// Run this with
//
//   traceur --experimental parallel-fibonacci.js max-iterations concurrent-attempts
//     max-iterations defaults to 50
//     concurrent-attempts defaults to 10

function fib(n) {
  var a = 0, b = 1;
  for (var i = 0; i < n; i++) {
    [a, b] = [b, a + b];

    // Every 4 iterations, 'yield'.
    if ((i & 3) === 0)
      await process.nextTick(); // await setTimeout(0);
  }
  return [a, b, i];
};

var maxIterations = Number(process.argv[2] || 50);
var concurrentAttempts = Number(process.argv[3] || 10);
for (var i = 0; i < concurrentAttempts; i++) {
  fib(Math.random() * maxIterations).then(([a, b, i]) => {
    console.log(`golden ratio for ${i} iterations: ${b / a} (last two values: ${a} ${b})`);
  }, (err) => console.error(err));
}

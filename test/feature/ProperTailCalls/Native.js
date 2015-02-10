// Options: --proper-tail-calls

var count = 0;

[1, 2, 3].forEach(function (n) {
  count += n;
});

assert.equal(count, 6);


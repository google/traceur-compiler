// Not enabled.
'use strong'

var count = 0;
for (var x in {x: 1}) {
  count++;
}
assert.equal(1, count);

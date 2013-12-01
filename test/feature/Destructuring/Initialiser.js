var [a = 0] = [];
assert.equal(0, a);

var {b = 1} = {};
assert.equal(1, b);

var {c = 2} = {c: 3};
assert.equal(3, c);

var {d = 4} = Object.create({d: 5});
assert.equal(5, d);

var {e: f = 6} = {};
assert.equal(6, f);

var {g: h = 7} = {h: 8};
assert.equal(7, h);

var [, , , i = 9] = [10, 11, 12];
assert.equal(9, i);

function j({x = 42}, expected) {
  assert.equal(expected, x);
}

j({}, 42);
j({x: 43}, 43);

var count = 0;
var [k = 42] = (count++, [21]);
assert.equal(21, k);
assert.equal(1, count);

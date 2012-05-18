var [a = 0] = [];
assertEquals(0, a);

var {b = 1} = {};
assertEquals(1, b);

var {c = 2} = {c: 3};
assertEquals(3, c);

var {d = 4} = Object.create({d: 5});
assertEquals(5, d);

var {e: f = 6} = {};
assertEquals(6, f);

var {g: h = 7} = {h: 8};
assertEquals(7, h);

var [, , , i = 9] = [10, 11, 12];
assertEquals(9, i);

function j({x = 42}, expected) {
  assertEquals(expected, x);
}

j({}, 42);
j({x: 43}, 43);

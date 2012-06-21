var res = [() => [x, y] for x of [0, 1] for y of [2, 3]];

assertEquals(4, res.length);
assertArrayEquals([0, 2], res[0]());
assertArrayEquals([0, 3], res[1]());
assertArrayEquals([1, 2], res[2]());
assertArrayEquals([1, 3], res[3]());

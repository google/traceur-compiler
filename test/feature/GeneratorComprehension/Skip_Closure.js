// Skip. The sugaring uses var instead of let which leads to wrong closure.

var iter = (() => [x, y] for x of [0, 1] for y of [2, 3]);

assertTrue(iter.moveNext());
var f1 = iter.current;

assertTrue(iter.moveNext());
var f2 = iter.current;

assertTrue(iter.moveNext());
var f3 = iter.current;

assertTrue(iter.moveNext());
var f4 = iter.current;

assertFalse(iter.moveNext());

assertArrayEquals([0, 2], f1());
assertArrayEquals([0, 3], f2());
assertArrayEquals([1, 2], f3());
assertArrayEquals([1, 3], f4());
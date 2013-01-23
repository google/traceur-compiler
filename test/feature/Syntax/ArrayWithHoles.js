var arr = [,1, ,3,];
assertEquals(4, arr.length);

var arr2 = [,1, ,...[3],];
assertEquals(4, arr.length);

var x, y;
[x, , y] = [0, 1, 2];
assertEquals(0, x);
assertEquals(2, y);

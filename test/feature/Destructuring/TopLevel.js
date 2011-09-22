var a, b, c, d;
[a, [b, c], d] = ['hello', [',', 'junk'], ['world']];

// ----------------------------------------------------------------------------

assertEquals('hello', a);
assertEquals(',', b);
assertEquals('junk', c);
assertArrayEquals(['world'], d);

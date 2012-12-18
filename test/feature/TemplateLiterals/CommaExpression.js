assertEquals('24', `${ 1, 2 }${ 3, 4 }`);
assertEquals('6', `${ 5, 6 }`);

function templateLiteralCommaTest(callsite, x, y) {
  assertEquals(2, x);
  assertEquals(4, y);
  return x + y;
}

assertEquals(6, templateLiteralCommaTest`${ 1, 2 }${ 3, 4 }`);

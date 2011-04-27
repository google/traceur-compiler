class Point {
  x, y;
}

// ----------------------------------------------------------------------------

var p = new Point();
var foundX = false;
var foundY = false;
for (var element in p) {
  if (element == 'x') {
    assertFalse(foundX);
    foundX = true;
  } else if (element == 'y') {
    assertFalse(foundY);
    foundY = true;
  } else {
    fail('found field ' + element);
  }
}

assertTrue(foundX);
assertTrue(foundY);

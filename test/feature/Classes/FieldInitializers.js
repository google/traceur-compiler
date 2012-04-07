class Point {
  constructor() {
    this.x = 0;
    this.y = 0;
  }
}

// ----------------------------------------------------------------------------

var p = new Point();
assertEquals(0, p.x);
assertEquals(0, p.y);
p.x = 1;
assertEquals(1, p.x);

var p2 = new Point();
assertEquals(0, p2.x);
assertEquals(0, p2.y);
assertEquals(1, p.x);

for (var element in Point) {
  fail('Point contains static member : ' + element);
}

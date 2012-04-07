class Point {
  constructor() {
    this.x = 0;
    this.y = 0;
  }
}

// ----------------------------------------------------------------------------

var p = new Point();

var keys = [];
for (var key in p) {
  keys.push(key);
}

assertTrue(keys.indexOf('x') !== -1);
assertTrue(keys.indexOf('y') !== -1);
assertTrue(keys.indexOf('constructor') === -1);

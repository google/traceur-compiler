class Universe {
  answer() {
    return 42;
  }
}

// ----------------------------------------------------------------------------

var universe = new Universe();
assertEquals(42, universe.answer());

var keys = [];
for (var key in universe) {
  keys.push(key);
}
assertTrue(keys.indexOf('answer') === -1);
assertTrue(keys.indexOf('constructor') === -1);

for (var key in Universe) {
  fail('Universe contains static member : ' + key);
}

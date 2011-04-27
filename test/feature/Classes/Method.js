class Universe {
  answer() {
    return 42;
  }
} 

// ----------------------------------------------------------------------------

var universe = new Universe();
assertEquals(42, universe.answer());

for (var element in universe) {
  assertEquals('answer', element);
}

for (var element in Universe) {
  fail('Universe contains static member : ' + element);
}

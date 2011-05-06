class ConstClass {
  const PI = 3.14;
}

// ----------------------------------------------------------------------------

var obj = new ConstClass();

// Harmony is always in strict mode.
assertThrows(function() {
  obj.PI = 4;
});
assertEquals(3.14, obj.PI);

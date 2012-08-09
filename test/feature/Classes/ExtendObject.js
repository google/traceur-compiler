// Cannot extend non functions.
assertThrows(function() {
  class C extends 42 {}
});

assertThrows(function() {
  class C extends {} {}
});

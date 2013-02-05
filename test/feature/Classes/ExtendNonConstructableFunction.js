
assertThrows(function() {
  class C extends Math.pow {}
});

assertThrows(function() {
  function f() {}
  // prototype needs to be an Object or null.
  f.prototype = 42;
  class C extends f {}
});

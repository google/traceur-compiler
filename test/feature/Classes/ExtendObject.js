// Cannot extend non objects.
assertThrows(function() {
  class C extends 42 {}
});

class C extends {
  m: function() {
    return 42;
  }
} {
  m() {
    return super.m();
  }
}

assertEquals(42, new C().m());

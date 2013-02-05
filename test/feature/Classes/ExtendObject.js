// Can no longer extend objects.
assertThrows(function() {
  class C extends {} {}
});

class ConstClass {
  const PI = 3.14;
}

// ----------------------------------------------------------------------------

var obj = new ConstClass();

// In strict mode, assigning to a const throws an error.
// TODO(rnystrom): Doesn't actually work.
/*
(function() {
  'use strict';

  assertThrows(function() {
    obj.PI = 4;
  });

  assertEquals(3.14, obj.PI);
})();
*/

// In non-strict mode, it silently ignores the assignment.
obj.PI = 4;
assertEquals(3.14, obj.PI);

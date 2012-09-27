// Options: --collections

import elementGet from '@name';

{
  var getLog = [];
  var object = {};

  object[elementGet] = function(index) {
    assertEquals(object, this);
    getLog.push(index);
    return function() {
      assertEquals(object, this);
      return index;
    };
  };

  var tmp = {};
  function f() {}
  var re = /regexp/

  assertEquals(object[0](), 0);
  assertEquals(object[null](), null);
  assertEquals(object[undefined](), undefined);
  assertEquals(object[true](), true);
  assertEquals(object[false](), false);
  assertEquals(object[tmp](), tmp);
  assertEquals(object[f](), f);
  assertEquals(object[re](), re);

  assertArrayEquals([0, null, undefined, true, false, tmp, f, re], getLog);
}

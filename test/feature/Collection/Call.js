// Options: --trap-member-lookup

import elementGet from '@name';

{
  var getLog = [];
  var object = {};

  object[elementGet] = function(index) {
    assert.equal(object, this);
    getLog.push(index);
    return function() {
      assert.equal(object, this);
      return index;
    };
  };

  var tmp = {};
  function f() {}
  var re = /regexp/

  assert.equal(object[0](), 0);
  assert.equal(object[null](), null);
  assert.equal(object[undefined](), undefined);
  assert.equal(object[true](), true);
  assert.equal(object[false](), false);
  assert.equal(object[tmp](), tmp);
  assert.equal(object[f](), f);
  assert.equal(object[re](), re);

  assertArrayEquals([0, null, undefined, true, false, tmp, f, re], getLog);
}

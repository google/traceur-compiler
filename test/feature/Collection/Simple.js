// Options: --trap-member-lookup

import {elementGet, elementSet, elementDelete} from '@name';

{
  var setLog = [];
  var getLog = [];
  var deleteLog = [];
  var object = {};

  object[elementGet] = function(name) {
    assert.equal(object, this);
    getLog.push(name);
    return name;
  };

  var tmp = {};
  function f() {}
  var re = /regexp/;

  assert.equal(object[0], 0);
  assert.equal(object[null], null);
  assert.equal(object[undefined], undefined);
  assert.equal(object[true], true);
  assert.equal(object[false], false);
  assert.equal(object[tmp], tmp);
  assert.equal(object[f], f);
  assert.equal(object[re], re);
  assert.equal(object.shouldNotCallCollectionGetter, undefined);

  assertArrayEquals([0, null, undefined, true, false, tmp, f, re], getLog);

  object[elementDelete] = function(name) {
    assert.equal(object, this);
    deleteLog.push(name);
    return true;
  };

  assert.isTrue(delete object[0]);
  assert.isTrue(delete object[null]);
  assert.isTrue(delete object[undefined]);
  assert.isTrue(delete object[true]);
  assert.isTrue(delete object[false]);
  assert.isTrue(delete object[tmp]);
  assert.isTrue(delete object[f]);
  assert.isTrue(delete object[re]);
  assert.isTrue(delete object.shouldNotCallCollectionSetter);

  assertArrayEquals([0, null, undefined, true, false, tmp, f, re], deleteLog);

  object[elementSet] = function(name, value) {
    assert.equal(object, this);
    assert.equal(name, value);
    setLog.push(name);
  };

  assert.equal(0, object[0] = 0);
  assert.equal(null, object[null] = null);
  assert.equal(undefined, object[undefined] = undefined);
  assert.equal(true, object[true] = true);
  assert.equal(false, object[false] = false);
  assert.equal(tmp, object[tmp] = tmp);
  assert.equal(f, object[f] = f);
  assert.equal(re, object[re] = re);
  assert.equal('shouldNotCallCollectionSetter',
      object.shouldNotCallCollectionSetter = 'shouldNotCallCollectionSetter');

  assertArrayEquals([0, null, undefined, true, false, tmp, f, re], setLog);

  setLog = [];
  getLog = [];

  object = {};
  object[elementGet] = function(name) {
    getLog.push(name);
    return name;
  };
  object[elementSet] = function(name, value) {
    setLog.push(name, value);
  };

  assert.equal(2, object[1] += 1);
  assert.equal(8, object[2] *= 4);
  assert.equal('ab', object['a'] += 'b');
  assert.equal(32, object[8] <<= 2);
  assertArrayEquals([1, 2, 'a', 8], getLog);
  assertArrayEquals([1, 2, 2, 8, 'a', 'ab', 8, 32], setLog);
}

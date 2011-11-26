{
  var setLog = [];
  var getLog = [];
  var deleteLog = [];
  var object = {};
  var Name = traceur.runtime.modules['@name'];
  var {elementGet, elementSet, elementDelete} = Name;

  object[elementGet] = function(name) {
    assertEquals(object, this);
    getLog.push(name);
    return name;
  };

  var tmp = {};
  function f() {}
  var re = /regexp/

  assertEquals(object[0], 0);
  assertEquals(object[null], null);
  assertEquals(object[undefined], undefined);
  assertEquals(object[true], true);
  assertEquals(object[false], false);
  assertEquals(object[tmp], tmp);
  assertEquals(object[f], f);
  assertEquals(object[re], re);
  assertEquals(object.shouldNotCallCollectionGetter, undefined);

  assertArrayEquals([0, null, undefined, true, false, tmp, f, re], getLog);

  object[elementDelete] = function(name) {
    assertEquals(object, this);
    deleteLog.push(name);
    return true;
  };

  assertTrue(delete object[0]);
  assertTrue(delete object[null]);
  assertTrue(delete object[undefined]);
  assertTrue(delete object[true]);
  assertTrue(delete object[false]);
  assertTrue(delete object[tmp]);
  assertTrue(delete object[f]);
  assertTrue(delete object[re]);
  assertTrue(delete object.shouldNotCallCollectionSetter);

  assertArrayEquals([0, null, undefined, true, false, tmp, f, re], deleteLog);

  object[elementSet] = function(name, value) {
    assertEquals(object, this);
    assertEquals(name, value);
    setLog.push(name);
  };

  assertEquals(0, object[0] = 0);
  assertEquals(null, object[null] = null);
  assertEquals(undefined, object[undefined] = undefined);
  assertEquals(true, object[true] = true);
  assertEquals(false, object[false] = false);
  assertEquals(tmp, object[tmp] = tmp);
  assertEquals(f, object[f] = f);
  assertEquals(re, object[re] = re);
  assertEquals('shouldNotCallCollectionSetter',
      object.shouldNotCallCollectionSetter = 'shouldNotCallCollectionSetter');

  assertArrayEquals([0, null, undefined, true, false, tmp, f, re], setLog);

}

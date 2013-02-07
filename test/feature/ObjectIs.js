assertTrue(Object.is(1, 1));
assertTrue(Object.is(0, 0));
assertTrue(Object.is(-0, -0));
assertTrue(Object.is(NaN, NaN));
assertTrue(Object.is(Infinity, Infinity));
assertTrue(Object.is(-Infinity, -Infinity));

assertFalse(Object.is(0, -0));
assertFalse(Object.is(-0, 0));
assertFalse(Object.is(Infinity, -Infinity));
assertFalse(Object.is(-Infinity, Infinity));

assertTrue(Object.is(true, true));
assertTrue(Object.is(false, false));

assertTrue(Object.is(null, null));
assertTrue(Object.is(undefined, undefined));

assertTrue(Object.is('', ''));
assertTrue(Object.is('a', 'a'));

{
  var object = {};
  assertTrue(Object.is(object, object));
}

assertFalse(Object.is(new String('a'), new String('a')));
assertFalse(Object.is(new Boolean, new Boolean));
assertFalse(Object.is(new Number, new Number));
assertFalse(Object.is(new Date(0), new Date(0)));
assertFalse(Object.is(/re/, /re/));
assertFalse(Object.is({}, {}));
assertFalse(Object.is([], []));
assertFalse(Object.is(function() {}, function() {}));

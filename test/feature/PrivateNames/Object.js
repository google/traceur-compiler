import Name from '@name';
var n = new Name;
var object = {};
object[n] = 42;
assertEquals(42, object[n]);
assertUndefined(object[n.public]);
assertUndefined(object[n + '']);
assertArrayEquals([], Object.getOwnPropertyNames(object));
assertFalse(object.hasOwnProperty(n));

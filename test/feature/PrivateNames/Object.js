import Name from '@name';
var n = new Name;
var object = {};
object[n] = 42;
assertEquals(42, object[n]);
assertUndefined(object[n.public]);
assertUndefined(object[n + '']);
assertArrayEquals([], Object.getOwnPropertyNames(object));
assertFalse(object.hasOwnProperty(n));

assertEquals(32, object[n] -= 10);
assertEquals(16, object[n] /= 2);
assertEquals(16, object[n]);

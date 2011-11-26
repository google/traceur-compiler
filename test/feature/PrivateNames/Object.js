var Name = traceur.runtime.modules['@name'];
var n = Name.create();
var object = {};
object[n] = 42;
assertEquals(42, object[n]);
assertUndefined(object[n.public]);
assertUndefined(object[n + '']);
assertArrayEquals([], Object.getOwnPropertyNames(object));
assertFalse(object.hasOwnProperty(n));

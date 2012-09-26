private @a;
var object = {};
object.@a = 42;
assertEquals(42, object.@a);

private @b = @a;
assertEquals(42, object.@b);

object.@b = 'Changed';
assertEquals(object.@a, object.@b);
assertEquals('Changed', object.@a);

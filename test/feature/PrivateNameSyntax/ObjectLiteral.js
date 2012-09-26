private @a, @b, @c, @m;
var object = {
  @a: 1,
  get @b() {
    return this.@c;
  },
  set @b(v) {
    this.@c = v;
  },
  @m() {
    return this.@b;
  }
};

assertEquals(1, object.@a);
assertEquals(undefined, object.@b);
object.@b = 2;
assertEquals(2, object.@b);
assertEquals(2, object.@m());

var objectWithProto = {
  __proto__: Array.prototype,
  length: 0,
  @a: 3
};

assertTrue(objectWithProto instanceof Array);
assertEquals(3, objectWithProto.@a);

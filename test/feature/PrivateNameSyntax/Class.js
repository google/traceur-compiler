private @a, @b, @c, @m;
class C {
  constructor() {
    this.@a = 1;
  }
  get @b() {
    return this.@c;
  }
  set @b(v) {
    this.@c = v;
  }
  @m() {
    return this.@b;
  }
};

var object = new C;

assertEquals(1, object.@a);
assertEquals(undefined, object.@b);
object.@b = 2;
assertEquals(2, object.@b);
assertEquals(2, object.@m());

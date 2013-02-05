var x = 42;

class B {
  static m() {
    return this;
  }

  static get x() {
    return x;
  }

  static set x(value) {
     x = value;
  }
}

assertEquals(B, B.m());
assertEquals(42, B.x);
B.x = 1;
assertEquals(1, x);

class StaticMethod {
  static static() {
    return 'static method';
  }
}

assertEquals('static method', StaticMethod.static());

class StaticGetter {
  static get static() {
    return 'static getter';
  }
}

assertEquals('static getter', StaticGetter.static);

class StaticSetter {
  static set static(value) {
    x = value;
  }
}

StaticSetter.static = 'static setter';
assertEquals('static setter', x);

class MethodNamedStatic {
  static() {
    return this;
  }
}

var c = new MethodNamedStatic();
assertEquals(c, c.static());

class AccessorNamedStatic {
  get static() {
    return [this, x];
  }

  set static(value) {
    x = [this, value];
  }
}

x = 2;
c = new AccessorNamedStatic();
assertArrayEquals([c, 2], c.static);
c.static = 3;
assertArrayEquals([c, 3], x);

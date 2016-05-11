var x = 'B.getter';

class B {
  static method() {
    return [this, 'B.method'];
  }

  static get getter() {
    return [this, x];
  }

  static set setter(value) {
    x = [this, value];
  }
}

class C extends B {
  static method() {
    return super.method();
  }

  static get getter() {
    return super.getter;
  }

  static set setter(value) {
    super.setter = value;
  }
}

assert.deepEqual([C, 'B.method'], C.method());
assert.deepEqual([C, 'B.getter'], C.getter);

C.setter = 'B.setter';
assert.deepEqual([C, 'B.setter'], x);

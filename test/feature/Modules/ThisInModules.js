var global = this;

module m {
  assertEquals(this, global);

  export var f = () => this;
}

assertEquals(global, m.f());

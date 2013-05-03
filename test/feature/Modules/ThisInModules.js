var global = this;

module m {
  assert.equal(this, global);

  export var f = () => this;
}

assert.equal(global, m.f());

var global = this;

module 'm' {
  assert.equal(this, global);

  export var f = () => this;
}

module m from 'm';
assert.equal(global, m.f());

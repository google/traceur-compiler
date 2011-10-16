// These tests are from:
// http://wiki.ecmascript.org/doku.php?id=strawman:arrow_function_syntax

// Use ''=>'' (fat arrow) for lexical ''this'', as in CoffeeScript
// ("fat" is apt because this form costs more than ''->'')
const obj = {
  method: function () {
    return => this;
  }
};
assertEquals(obj.method()(), obj);

// And *only* lexical ''this'' for => functions
let fake = {steal: obj.method()};
assertEquals(fake.steal(), obj);

// But ''function'' still has dynamic ''this''
let real = {borrow: obj.method};
assertEquals(real.borrow()(), real);

// Recap:
//  use ''->'' instead of ''function'' for lighter syntax
//  use ''=>'' instead of calling bind or writing a closure
const obj2 = {
  method: () -> (=> this)
};
assertEquals(obj2.method()(), obj2);

let fake2 = {steal: obj2.method()};
assertEquals(fake2.steal(), obj2);

let real2 = {borrow: obj2.method};
assertEquals(real2.borrow()(), real2);

// An explicit ''this'' parameter can have an initializer
// Semantics are as in the "parameter default values" Harmony proposal
const self = {c: 0};
const self_bound = (this = self, a, b) -> {
  this.c = a * b;
};
self_bound(2, 3);
assertEquals(self.c, 6);

const other = {c: "not set"};
self_bound.call(other, 4, 5);
assertEquals(other.c, "not set");
assertEquals(self.c, 20);

// ''=>'' is short for ''->'' with an explicit ''this'' parameter
function outer() {
  const bound    = () => this;
  const bound2   = (this = this) -> this; // initializer has outer ''this'' in scope
  const unbound  = () -> this;
  /* TODO: does this have any effect?
  const unbound2 = (this) -> this;
  */
  const unbound2 = unbound;

  return [bound, bound2, unbound, unbound2];
}

const t = {},
      u = {};

const v = outer.call(t);

assertEquals(v[0](), t);
assertEquals(v[1](), t);
// TODO: softBind?
//assertEquals(v[2](), t);
//assertEquals(v[3](), t);
assertEquals(v[2](), v);
assertEquals(v[3](), v);

assertEquals(v[0].call(u), t);
assertEquals(v[1].call(u), t);
assertEquals(v[2].call(u), u);
assertEquals(v[3].call(u), u);

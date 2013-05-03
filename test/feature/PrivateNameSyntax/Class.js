// Options: --private-names --private-name-syntax

// IIFE to hide private names from other tests.
(function() {

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

  assert.equal(1, object.@a);
  assert.equal(undefined, object.@b);
  object.@b = 2;
  assert.equal(2, object.@b);
  assert.equal(2, object.@m());

})();
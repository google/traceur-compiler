// Should not compile.
// Options: --block-binding
// Error: :8:22: Unexpected token in

var x = 0;

// ES6 does not allow this.
for (var i = (x = 1) in {}) {
}

assert.equal(1, x);

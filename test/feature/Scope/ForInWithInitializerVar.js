// Options: --block-binding

var x = 0;

// ES5 allows this.
for (var i = (x = 1) in {}) {
}

assert.equal(1, x);

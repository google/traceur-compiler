var x = 0;

// ES5 allows this.
for (var i = (x = 1) in {}) {
}

assertEquals(1, x);

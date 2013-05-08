module m {
  export var a = 1;
  export var b = 2;
}

module n {
  export var c = 3;
  export var d = 4;
}

module o {
  export * from m, * from n;
}

assert.equal(1, o.a);
assert.equal(2, o.b);
assert.equal(3, o.c);
assert.equal(4, o.d);

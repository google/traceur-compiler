function* f() {
  yield this;
}

var o = {};
for (var x of f.call(o)) {
  assertEquals(o, x);
}

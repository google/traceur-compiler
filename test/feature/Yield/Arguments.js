function* f() {
  yield [arguments[0], arguments[1]];
}

for (var arr of f(1, 2)) {
  assertEquals(1, arr[0]);
  assertEquals(2, arr[1]);
}
// Should not compile.

function* gen() {
  yield 1;
}

for (const i = 0 of gen()) {
}

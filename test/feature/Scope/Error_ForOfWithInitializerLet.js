// Should not compile.

function* gen() {
  yield 1;
}

for (let i = 0 of gen()) {
}

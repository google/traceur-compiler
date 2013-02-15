// Should not compile.
// Options: --block-binding

function* gen() {
  yield 1;
}

for (const i = 0 of gen()) {
}

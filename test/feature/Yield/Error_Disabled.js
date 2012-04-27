// Should not compile.
// Options: --generators=false

function* range(start, end) {
  for (var i = start; i < end; i++) {
    yield i;
  }
}

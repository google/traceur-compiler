// Should not compile.
// Error: Only 'a = yield b' and 'var a = yield b' currently supported.
function* G(x) {
  var a = (yield x) + (yield x);
}

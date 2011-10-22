// Should not compile.
// Options: --forOf=false

var s = [];
for (var i of yieldFor()) {
  s.push(i);
}

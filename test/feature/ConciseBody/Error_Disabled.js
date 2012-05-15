// Should not compile.
// Options: --conciseBody=false
// Error: (6, 7): '{' expected

var object = {
  m() 1
  get x() 1,
  set y(value) void 0
};

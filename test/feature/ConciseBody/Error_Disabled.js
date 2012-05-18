// Should not compile.
// Options: --concise-body=false
// Error: (6, 7): '{' expected

var object = {
  m() 1
  get x() 1,
  set y(value) void 0
};

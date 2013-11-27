// Should not compile.
// Options: --generator-comprehension=false
// Error: :5:13: Unexpected token for

var iter = (for (x of [0, 1, 2, 3, 4]) x);

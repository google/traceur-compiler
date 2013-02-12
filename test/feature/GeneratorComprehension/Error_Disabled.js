// Should not compile.
// Options: --generator-comprehension=false
// Error: :5:13: primary expression expected

var iter = (for (x of [0, 1, 2, 3, 4]) x);

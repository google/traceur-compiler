// Should not compile.
// Options: --array-comprehension=false
// Error: :5:14: ']' expected

var array = [for (x of [0, 1, 2, 3, 4]) x];

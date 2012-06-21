// Should not compile.
// Options: --arrayComprehension=false
// Error: (5, 16): ',' expected

var array = [x for x of [0, 1, 2, 3, 4]];

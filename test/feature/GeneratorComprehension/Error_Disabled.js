// Should not compile.
// Options: --generatorComprehension=false
// Error: (5, 15): ')' expected

var iter = (x for x of [0, 1, 2, 3, 4]);

// Should not compile.
// Error: (4, 13): invalid formal parameter for "=>" expression

var f = (a, b + 5) => a + b;

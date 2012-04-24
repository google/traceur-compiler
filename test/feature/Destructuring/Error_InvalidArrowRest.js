// Should not compile.
// Error: Rest pattern must be the last element of an array pattern

var f = ([...xs, ys]) => xs;

// These tests are from:
// http://wiki.ecmascript.org/doku.php?id=strawman:arrow_function_syntax

// TODO: should we support empty arrow?
// Empty arrow function is minimal-length
// let empty = ->;
let empty = -> undefined;
assertEquals(empty(), undefined);

// Expression bodies needs no parentheses or braces
let identity = (x) -> x;
assertEquals(identity(empty), empty);

// Fix: object initialiser need not be parenthesized, see Grammar Changes
let key_maker = (val) -> {key: val};
assertEquals(key_maker(empty).key, empty);

// Nullary arrow function starts with arrow (cannot begin statement)
const preamble = 'hello';
const body = 'world';
let nullary = -> preamble + ': ' + body;
assertEquals('hello: world', nullary());

// No need for parens even for lower-precedence expression body
let square = (x) -> x * x;
assertEquals(81, square(9));

// Statement body needs braces (completion return TODO)
let oddArray = [];
let array = [2, 3, 4, 5, 6, 7];
array.forEach((v, i) -> { if (i & 1) oddArray[i >>> 1] = v; });
assertEquals('3,5,7', oddArray.toString());

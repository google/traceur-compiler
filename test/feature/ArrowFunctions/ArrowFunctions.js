// These tests are from:
// http://wiki.ecmascript.org/doku.php?id=strawman:arrow_function_syntax

let empty = () => undefined;
assertEquals(empty(), undefined);

// Expression bodies needs no parentheses or braces
let identity = (x) => x;
assertEquals(identity(empty), empty);

// Object literals needs to be wrapped in parens.
let keyMaker = (val) => ({key: val});
assertEquals(keyMaker(empty).key, empty);

// => { starts a block.
let emptyBlock = () => {a: 42};
assertEquals(emptyBlock(), undefined);

// Nullary arrow function starts with arrow (cannot begin statement)
const preamble = 'hello';
const body = 'world';
let nullary = () => preamble + ': ' + body;
assertEquals('hello: world', nullary());

// No need for parens even for lower-precedence expression body
let square = x => x * x;
assertEquals(81, square(9));

let oddArray = [];
let array = [2, 3, 4, 5, 6, 7];
array.forEach((v, i) => { if (i & 1) oddArray[i >>> 1] = v; });
assertEquals('3,5,7', oddArray.toString());

var f = (x = 42) => x;
assertEquals(42, f());

{
  let g = (...xs) => xs;
  assertArrayEquals([0, 1, true], g(0, 1, true));
}

// TODO(arv): We require the arrow function to be wrapped in parens. Is that
// correct?
assertEquals(typeof (() => {}),'function');
assertEquals(Object.getPrototypeOf(() => {}), Function.prototype);

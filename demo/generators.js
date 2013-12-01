
// Example 1. Writing an iterator over an array

function iterateElements(array) {
  var index = 0;
  var rv = {};
  rv[Symbol.iterator] = {
      next() {
        if (index < array.length)
          return {value: array[index++], done: false};
        return {done: true};
      }
    }
  };
  return rv;
}

function* iterateElements2(array) {
  for (var index = 0; index < array.length; index++) {
    yield array[index];
  }
}

// Example 2. Fibonacci

// precomputes a fixed set
function fib(max) {
  var a = 0, b = 1;
  var results = [];
  while (b < max) {
    results.push(b);
    [a, b] = [b, a + b];
  }
  return results;
}

// infinite list
function* fib2() {
  var a = 0, b = 1;
  while (true) {
    yield b;
    [a, b] = [b, a + b];
  }
}

// Example 3. Inorder tree traversal
// (from http://www.python.org/dev/peps/pep-0255/)

// A binary tree class.
function Tree(label, left, right) {
  this.label = label;
  this.left = left;
  this.right = right;
}

// Create a Tree from a list.
function tree(list) {
  var n = list.length;
  if (n == 0) {
    return null;
  }
  var i = Math.floor(n / 2);
  return new Tree(list[i], tree(list.slice(0, i)), tree(list.slice(i + 1)));
}

// A recursive generator that generates Tree labels in in-order.
function* inorder1(t) {
  if (t) {
    for (var x of inorder1(t.left)) {
      yield x;
    }
    yield t.label;
    for (var x of inorder1(t.right)) {
      yield x;
    }
  }
}

// Show it off: create a tree.
var root = tree('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
// Print the nodes of the tree in in-order.
var result = '';
for (let x of inorder1(root)) {
  result += x;
}
alert(result);

// A non-recursive generator.
function* inorder2(node) {
  var stack = [];
  while (node) {
    while (node.left) {
      stack.push(node);
      node = node.left;
    }
    yield node.label;
    while (!node.right && stack.length) {
      node = stack.pop();
      yield node.label;
    }
    node = node.right;
  }
}

// Exercise the non-recursive generator.
var result = '';
for (var x of inorder2(root)) {
  result += x;
}
alert(result);

// Example 4. map and filter

// These can be combined without creating intermediate arrays
function* map(list, fun) {
  for (var item of list) {
    yield fun(item);
  }
}
function* filter(list, fun) {
  for (var item of list) {
    if (fun(item)) {
      yield item;
    }
  }
}

// squares even numbers. no intermediate array is created.
var numbers = [1,2,3,4,5,6,7,8,9,10];
var squares = map(
    filter(numbers, function(x) { return x % 2 == 0; }),
    function(x) { return x * x; });

numbers = [];
for (let s of squares) {
  numbers.push(s);
}
alert(numbers.join('_'));

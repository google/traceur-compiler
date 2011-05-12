// A binary tree class.
class Tree {
  new(label, left, right) {
    this.label = label;
    this.left = left;
    this.right = right;
  }

  function __iterator__() {
    if (this.left) {
      yield for this.left;
    }
    yield this.label;
    if (this.right) {
      yield for this.right;
    }
  }
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
function inorder1(t) {
  if (t) {
    for (var x : inorder1(t.left)) {
      yield x;
    }
    yield t.label;
    for (var x : inorder1(t.right)) {
      yield x;
    }
  }
}

// A non-recursive generator.
function inorder2(node) {
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

function accumulate(iterator) {
  var result = '';
  for (var value : iterator) {
    result = result + String(value);
  }
  return result;
}

// ----------------------------------------------------------------------------

var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var root = tree(alphabet);
assertEquals(alphabet, accumulate(inorder1(root)));
assertEquals(alphabet, accumulate(inorder2(root)));
// TODO(jmesserly) assertEquals(alphabet, accumulate(root));

// Options: --types=true --type-assertions --type-assertion-module=./resources/assert
function returnType():Number { return 1; }

function multipleReturnPaths(value):Number {
  if (value)
    return 1;
  return 2;
}

function returnWithinForLoop(value):Boolean {
  if (!value)
    return false;

  for (var i = 0; i < 10; i++) {
    if (i === value)
      return true;
  }

  return false;
}

function returnWithinWhileLoop(value):Boolean {
  var i = 0;
  while(++i < 10) {
    if (i === value) {
      return true;
    }
  }
  return false;
}

function returnWithinDoWhileLoop(value):Boolean {
  var i = 0;
  do {
    if (i === value) {
      return true;
    }
  } while (++i < 10);
  return false;
}

function returnExpression(value):Number {
  return value === 0 ? 0 : value / 2;
}

function throwsAssertion():Boolean {
  return {test: '123'};
}

function nested(value):Boolean {
  var square = function (value):Number {
    return value * value;
  };

  return square(value) > 0;
}

function returnVoid(x): void {
  return x;
}

assert.equal(1, returnType());
assert.equal(1, multipleReturnPaths(true));
assert.equal(2, multipleReturnPaths(false));
assert.equal(true, nested(2));
assert.isFalse(nested(0));
assert.isFalse(returnWithinForLoop(0));
assert.isTrue(returnWithinForLoop(5));
assert.isFalse(returnWithinForLoop(20));
assert.isTrue(returnWithinWhileLoop(5));
assert.isFalse(returnWithinWhileLoop(20));
assert.isTrue(returnWithinDoWhileLoop(5));
assert.isFalse(returnWithinDoWhileLoop(20));
assert.equal(0, returnExpression(0));
assert.equal(2, returnExpression(4));
assert.equal(undefined, returnVoid());
assert.throw(throwsAssertion, chai.AssertionError);

// Options: --types --type-assertions --type-assertion-module=./resources/assert.js

import {AssertionError} from '../../asserts.js';

function returnType(): number { return 1; }

function multipleReturnPaths(value): number {
  if (value)
    return 1;
  return 2;
}

function returnWithinForLoop(value): boolean {
  if (!value)
    return false;

  for (var i = 0; i < 10; i++) {
    if (i === value)
      return true;
  }

  return false;
}

function returnWithinWhileLoop(value): boolean {
  var i = 0;
  while(++i < 10) {
    if (i === value) {
      return true;
    }
  }
  return false;
}

function returnWithinDoWhileLoop(value): boolean {
  var i = 0;
  do {
    if (i === value) {
      return true;
    }
  } while (++i < 10);
  return false;
}

function returnExpression(value): number {
  return value === 0 ? 0 : value / 2;
}

function throwsAssertion(): boolean {
  return {test: '123'};
}

function nested(value): boolean {
  var square = function (value): number {
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
assert.throw(throwsAssertion, AssertionError);

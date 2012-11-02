'use strict';

// test MemberLookupExpression
function f(a) {
  var b = [42];
  return (a||b)[0];
}

assertEquals(42, f(null));
assertEquals(43, f([43]));

// test NewExpression
var a, b = function() { this.ans = 42; };
assertEquals(new (a||b)().ans, 42);

a = function() { this.ans = 43; };
assertEquals(new (a||b)().ans, 43);

// test CallExpression
a = undefined;
b = function() { return 42; }
assertEquals((a||b)(), 42);

a = function() { return 43; }
assertEquals((a||b)(), 43);

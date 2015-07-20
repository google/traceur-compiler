// Options: --types --type-assertions --type-assertion-module=./resources/assert.js

var s: symbol = Symbol();
assert.throw(() => {
  var s: symbol = 42;
});

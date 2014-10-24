// Options: --types --type-assertions --type-assertion-module=./resources/assert --symbols

var s: symbol = Symbol();
assert.throw(() => {
  var s: symbol = 42;
});

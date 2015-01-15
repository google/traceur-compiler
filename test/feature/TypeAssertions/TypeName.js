// Options: --types --type-assertions --type-assertion-module=./resources/assert.js

var a = {
  B: class {}
};

var b : a.B = new a.B();

assert.throw(() => {
  var c : a.B = 42;
});

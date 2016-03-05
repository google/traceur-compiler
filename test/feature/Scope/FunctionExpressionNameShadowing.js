// Options: --block-binding

var x = function y() {
  'use strict';
  var y = 1;
  return y;
}

assert.equal(x(), 1);

var z = function y() {
  'use strict';
  let y = 2;
  return y;
}

assert.equal(z(), 2);

var w = function y() {
  'use strict';
  let y = 3;
  return y;
}

assert.equal(w(), 3);

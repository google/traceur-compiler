// Options: --block-binding
// Error: :8:9: Duplicate declaration, y

var x = function y() {
  'use strict';
  const y = 1;
  {
    var y = 2;
    return y;
  }
}

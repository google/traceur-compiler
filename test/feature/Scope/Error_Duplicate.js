// Options: --block-binding
// Error: :8:9: Duplicate declaration, f

(function f() {
  'use strict';
  {
    var f;
    let f;
  }
})();

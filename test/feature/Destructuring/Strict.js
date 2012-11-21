function f({x}) {
  'use strict';
  return this;
}

assertUndefined(f({x: 42}));
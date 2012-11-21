function f(a = 1) {
  'use strict';
  return this;
}

assertUndefined(f());

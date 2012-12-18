'use strict';

function f(...args) {
  return this;
}

assertEquals(undefined, f `a`);

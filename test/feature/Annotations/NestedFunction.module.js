// Options: --annotations --types
import {
  Anno,
  X
} from './resources/setup.js';

function f(a = function() {
  // body of default param expression
  function g(@Anno x : X) {}
  return g;
}) {
  return a();
}

var nested = f();
assertArrayEquals([[X, new Anno]], nested.parameters);


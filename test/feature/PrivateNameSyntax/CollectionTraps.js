// Options: --modules --private-names --private-name-syntax --trap-member-lookup

import {elementGet, elementSet} from '@name';
private @elementGet = elementGet, @elementSet = elementSet;

var object = {};
object.@elementSet = function(name, value) {
  assert.equal(42, name);
  assert.equal('hello', value);
};
object.@elementGet = function(name) {
  assert.equal(42, name);
  return 'world';
};
object[42] = 'hello';
assert.equal('world', object[42]);

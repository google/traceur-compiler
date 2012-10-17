// Options: --modules --private-names --private-name-syntax --trap-member-lookup

import {elementGet, elementSet} from '@name';
private @elementGet = elementGet, @elementSet = elementSet;

var object = {};
object.@elementSet = function(name, value) {
  assertEquals(42, name);
  assertEquals('hello', value);
};
object.@elementGet = function(name) {
  assertEquals(42, name);
  return 'world';
};
object[42] = 'hello';
assertEquals('world', object[42]);

export var assert = global.assert;
assert.type = function (actual, type) {
  assert.typeOf(actual, type.name);
  return actual;
};

export var assert = this.assert;
assert.type = function (actual, type) {
  var typeName = type.name ? type.name :
      type.toString().match(/^function\s*([^\s(]+)/)[1];
  assert.typeOf(actual, typeName);
  return actual;
};

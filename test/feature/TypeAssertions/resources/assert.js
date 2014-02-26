export var assert = this.assert;

assert.type = function (actual, type) {
  if (type === $traceurRuntime.type.any) {
    return actual;
  }

  if (type === $traceurRuntime.type.void) {
    assert.isUndefined(actual);
    return actual;
  }

  var typeName = type.name || type.toString().match(/^\s*function\s*([^\s(]+)/)[1];
  assert.typeOf(actual, typeName);
  return actual;
};


assert.argumentTypes = function(...params) {
  for (var i = 0; i < params.length; i += 2) {
    if (params[i + 1] !== null) {
      assert.type(params[i], params[i + 1]);
    }
  }
};

assert.returnType = assert.type;

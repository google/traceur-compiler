export var assert = this.assert;

assert.type = function (actual, type) {
  if (type === $traceurRuntime.type.any) {
    return actual;
  }

  if (type === $traceurRuntime.type.void) {
    assert.isUndefined(actual);
    return actual;
  }

  if ($traceurRuntime.type[type.name] === type) {
    // chai.assert treats Number as number :'(
    // Use runtime to handle symbol
    assert.equal($traceurRuntime.typeof(actual), type.name);
  } else {
    assert.instanceOf(actual, type);
  }

  // TODO(arv): Handle generics, structural types and more.

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

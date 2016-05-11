// Options: --annotations
var x = {
  Simple: function () {
    this.name = 'x.Simple';
  },
  nested: {
    Args: function (a) {
      this.name = 'x.nested.Args';
      this.a = a;
    }
  }
}

@x.Simple
class SimpleAnnotation {
  @x.Simple
  annotatedMethod() {}
}

@x.nested.Args('class')
class NestedWithArgs {
  @x.nested.Args('method')
  annotatedMethod() {}
}

assert.deepEqual([new x.Simple], SimpleAnnotation.annotations);
assert.deepEqual([new x.Simple],
    SimpleAnnotation.prototype.annotatedMethod.annotations);

assert.deepEqual([new x.nested.Args('class')], NestedWithArgs.annotations);
assert.deepEqual([new x.nested.Args('method')],
    NestedWithArgs.prototype.annotatedMethod.annotations);

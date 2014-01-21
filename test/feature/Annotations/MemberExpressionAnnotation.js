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

assertArrayEquals([new x.Simple], SimpleAnnotation.annotations);
assertArrayEquals([new x.Simple],
    SimpleAnnotation.prototype.annotatedMethod.annotations);

assertArrayEquals([new x.nested.Args('class')], NestedWithArgs.annotations);
assertArrayEquals([new x.nested.Args('method')],
    NestedWithArgs.prototype.annotatedMethod.annotations);

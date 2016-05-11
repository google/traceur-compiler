// Options: --atscript

class Inject {}
class Bar {}

@Inject
class Foo {
  static id: number;
  name: string;

  constructor(bar: Bar) {}
}

var foo = new Foo(new Bar());

assert.deepEqual([new Inject], Foo.annotations);
assert.deepEqual([[Bar]], Foo.parameters);

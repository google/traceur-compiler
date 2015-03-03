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

assertArrayEquals([new Inject], Foo.annotate);
assertArrayEquals([[Bar]], Foo.parameters);

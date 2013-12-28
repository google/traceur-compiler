class NgDirective {
  constructor(expr) {
    this.expr = expr;
  }
}

class NgMapAttr {
  constructor(expr) {
    this.expr = expr;
  }
}

class Inject {}

class Test {
  constructor(x) {
    this.x = x;
  }
}

@Inject
@Test('ExportedFn')
export function ExportedFn(a, b) {
  console.log("Exported Fn: " + a + ", " + b);
}

@Inject
function Fn(a, b) {
  console.log("Exported Fn: " + a + ", " + b);
}


@NgDirective('[ng-bind]')
@Test
export class ExportedFoo {
  @Inject
  constructor(a, b) {
    this.foo = a;
  }

  @Test('helloWorld')
  helloWorld() {
    console.log('Hello from ' + this.name);
  }

  @NgMapAttr('expr')
  @Test('name')
  get name() {
    return this.foo;
  }

  @NgMapAttr('expr2')
  set value(@Test('x') x) {
    this.x = x;
  }
}

@NgDirective('[ng-bind]')
class Foo {
  @Inject
  constructor(@Inject a:Foo, @Test('b') b) {
    this.foo = a;
  }

  @Test('helloWorld')
  helloWorld(@Test('a')...a:Foo) {
    console.log('Hello from ' + this.name, a);
  }

  @NgMapAttr('expr')
  @Test('name')
  get name():Foo {
    return this.foo;
  }

  @NgMapAttr('expr2')
  set value(x:Foo) {
    this.x = x;
  }
}


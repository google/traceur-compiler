// Should not compile.
class A {}

class ImproperSuper extends A {
  method() {
    return super;
  }
}


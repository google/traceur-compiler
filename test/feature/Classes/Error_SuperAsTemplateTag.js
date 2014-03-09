// Should not compile.
// Error: :8:18: Unexpected token no substitution template

class A {}

class ImproperSuper extends A {
  method() {
    return super ``;
  }
}


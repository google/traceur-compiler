// Should not compile.
// Error: 6:5: Strict mode code may not include a with statement

class C {
  method() {
    with ({}) {}
  }
}
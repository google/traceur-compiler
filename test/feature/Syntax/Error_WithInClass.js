// Should not compile.
// SyntaxError: feature/Syntax/Error_WithInClass.js:6:5: Strict mode code may not include a with statement

class C {
  method() {
    with ({}) {}
  }
}
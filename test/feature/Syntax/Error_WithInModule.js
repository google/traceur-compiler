// Should not compile.
// Error: 5:3: Strict mode code may not include a with statement

module testStict {
  with ({}) {}
}
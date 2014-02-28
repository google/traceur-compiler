// Should not compile.
// Error: :6:7: Unexpected token *

function* yieldStarNewLine() {
  yield
      *42;
}

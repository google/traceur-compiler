// Should not compile.
// Error: :5:16: Unexpected token '='

function f() {
  ({a = (0, {a = 0})} = {})
}

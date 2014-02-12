// Should not compile.
// SyntaxError: feature/Syntax/Error_WithInStrictFunction.js:7:3: Strict mode code may not include a with statement

function testWithInStrict() {
  'use foo';
  'use strict';
  with ({}) {}
}
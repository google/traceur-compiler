// Should not compile.
// Error: 7:3: Strict mode code may not include a with statement

function testWithInStrict() {
  'use foo';
  'use strict';
  with ({}) {}
}
// Should not compile.
// Error: :5:26: implements is a reserved identifier

'use strict';
function testImplements({implements}) {
  return 42;
}

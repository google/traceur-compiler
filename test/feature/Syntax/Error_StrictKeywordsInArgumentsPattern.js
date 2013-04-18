// Should not compile.
// Error: :4:26: implements is a reserved identifier

function testImplements({implements}) {
  'use strict';
  return 42;
}

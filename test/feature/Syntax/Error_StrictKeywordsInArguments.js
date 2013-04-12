// Should not compile.
// Error: :4:25: implements is a reserved identifier

function testImplements(implements) {
  'use strict';
  return 42;
}

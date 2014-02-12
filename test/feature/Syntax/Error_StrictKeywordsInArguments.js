// Should not compile.
// SyntaxError: feature/Syntax/Error_StrictKeywordsInArguments.js:4:25: implements is a reserved identifier

function testImplements(implements) {
  'use strict';
  return 42;
}

// Should not compile.
// SyntaxError: feature/Syntax/Error_StrictKeywordsInArgumentsPattern.js:4:26: implements is a reserved identifier

function testImplements({implements}) {
  'use strict';
  return 42;
}

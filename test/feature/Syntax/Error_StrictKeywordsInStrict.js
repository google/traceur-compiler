// Should not compile.
// SyntaxError: feature/Syntax/Error_StrictKeywordsInStrict.js:5:26: implements is a reserved identifier

'use strict';
function testImplements({implements}) {
  return 42;
}

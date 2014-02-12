// Should not compile.
// SyntaxError: feature/Syntax/Error_WithInStrictProgram.js:6:1: Strict mode code may not include a with statement

'use foo';
'use strict';
with ({}) {}

// Should not compile.
// Error: :6:11: yield is a reserved identifier

function testStrictKeywordsInPropertyDefinitionIdentifierReference() {
  'use strict';
  return {yield};
}

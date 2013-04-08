function testUseStrictLineContinuation() {
  'use \
strict';
  return this;
}

assertNotEquals(testUseStrictLineContinuation(), undefined);

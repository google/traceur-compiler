function testUseStrictEscapeSequence() {
  'use str\x69ct';
  return this;
}

assertNotEquals(testUseStrictEscapeSequence(), undefined);


{
  function expose(callSite, var_args) {
    assertTrue(Object.isFrozen(callSite));
    assertTrue(callSite.hasOwnProperty('raw'));
    assertTrue(Object.isFrozen(callSite.raw));
    assertTrue(callSite.hasOwnProperty('cooked'));
    assertTrue(Object.isFrozen(callSite.cooked));
    assertEquals(callSite.raw.length, callSite.cooked.length);

    // The number of the literal portions is always same or one greater than the
    // number of substitutions
    var literalPortionCount = callSite.raw.length;
    var substitutionCount = arguments.length - 1;
    assertTrue(literalPortionCount == substitutionCount ||
               literalPortionCount == substitutionCount + 1);

    return arguments;
  }

  let x = 3;
  let y = 5;

  assertEquals(1, expose``.length);
  assertEquals(1, expose`a`.length);
  assertEquals(2, expose`a$x`.length);
  assertEquals(2, expose`a$x b`.length);
  assertEquals(3, expose`a$x $y`.length);
  assertEquals(3, expose`${x}${y}`.length);
  assertEquals(2, expose`${x}a`.length);

  assertEquals(0, expose``[0].raw.length);

  assertArrayEquals(['a'], expose`a`[0].raw);
  assertArrayEquals(['a'], expose`a`[0].cooked);

  assertArrayEquals(['\\n'], expose`\n`[0].raw);
  assertArrayEquals(['\n'], expose`\n`[0].cooked);

  assertArrayEquals(['\\r'], expose`\r`[0].raw);
  assertArrayEquals(['\r'], expose`\r`[0].cooked);

  assertArrayEquals(['\\f'], expose`\f`[0].raw);
  assertArrayEquals(['\f'], expose`\f`[0].cooked);

  assertArrayEquals(['\\b'], expose`\b`[0].raw);
  assertArrayEquals(['\b'], expose`\b`[0].cooked);

  assertArrayEquals(['\\u2028'], expose`\u2028`[0].raw);
  assertArrayEquals(['\u2028'], expose`\u2028`[0].cooked);

  assertArrayEquals(['\\u2029'], expose`\u2029`[0].raw);
  assertArrayEquals(['\u2029'], expose`\u2029`[0].cooked);

  assertArrayEquals(['a', 'b'], expose`a${x}b`[0].raw);
  assertArrayEquals(['a', 'b'], expose`a${x}b`[0].cooked);

  // Thes have tab characters in them.
  assertArrayEquals(['\t', '\\t'], expose`	${x}\t`[0].raw);
  assertArrayEquals(['\t', '\t'], expose`	${x}\t`[0].cooked);

  assertArrayEquals(['\n', '\\n'], expose`
${x}\n`[0].raw);
  assertArrayEquals(['\n', '\n'], expose`
${x}\n`[0].cooked);

  // These contains the ES new line chars \u2028 and \u2029
  assertArrayEquals(['\u2028', '\\u2028'], expose` ${x}\u2028`[0].raw);
  assertArrayEquals(['\u2028', '\u2028'], expose` ${x}\u2028`[0].cooked);

  assertArrayEquals(['\u2029', '\\u2029'], expose` ${x}\u2029`[0].raw);
  assertArrayEquals(['\u2029', '\u2029'], expose` ${x}\u2029`[0].cooked);

  assertArrayEquals(['a/*b*/c'], expose`a/*b*/c`[0].raw);
  assertArrayEquals(['a/*b*/c'], expose`a/*b*/c`[0].cooked);

  assertArrayEquals(['a'], expose/* comment */`a`[0].raw);
  assertArrayEquals(['a'], expose/* comment */`a`[0].cooked);

}

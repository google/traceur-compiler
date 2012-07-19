{
  function expose(callSite, var_args) {
    assertTrue(Array.isArray(callSite));
    assertTrue(Object.isFrozen(callSite));
    var rawDescr = Object.getOwnPropertyDescriptor(callSite, 'raw');
    assertTrue(rawDescr !== undefined);
    assertTrue('value' in rawDescr);
    assertFalse(rawDescr.enumerable);
    assertFalse(rawDescr.writable);
    assertFalse(rawDescr.configurable);
    assertTrue(Object.isFrozen(callSite.raw));
    assertTrue(Array.isArray(callSite.raw));
    assertTrue(Object.isFrozen(callSite.raw));
    assertEquals(callSite.raw.length, callSite.length);

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
  assertEquals(2, expose`a${x}`.length);
  assertEquals(2, expose`a${x} b`.length);
  assertEquals(3, expose`a${x} ${y}`.length);
  assertEquals(3, expose`${x}${y}`.length);
  assertEquals(2, expose`${x}a`.length);

  assertEquals(0, expose``[0].raw.length);

  assertArrayEquals(['a'], expose`a`[0].raw);
  assertArrayEquals(['a'], expose`a`[0]);

  assertArrayEquals(['\\n'], expose`\n`[0].raw);
  assertArrayEquals(['\n'], expose`\n`[0]);

  assertArrayEquals(['\\r'], expose`\r`[0].raw);
  assertArrayEquals(['\r'], expose`\r`[0]);

  assertArrayEquals(['\\f'], expose`\f`[0].raw);
  assertArrayEquals(['\f'], expose`\f`[0]);

  assertArrayEquals(['\\b'], expose`\b`[0].raw);
  assertArrayEquals(['\b'], expose`\b`[0]);

  assertArrayEquals(['\\u2028'], expose`\u2028`[0].raw);
  assertArrayEquals(['\u2028'], expose`\u2028`[0]);

  assertArrayEquals(['\\u2029'], expose`\u2029`[0].raw);
  assertArrayEquals(['\u2029'], expose`\u2029`[0]);

  assertArrayEquals(['a', 'b'], expose`a${x}b`[0].raw);
  assertArrayEquals(['a', 'b'], expose`a${x}b`[0]);

  // Thes have tab characters in them.
  assertArrayEquals(['\t', '\\t'], expose`	${x}\t`[0].raw);
  assertArrayEquals(['\t', '\t'], expose`	${x}\t`[0]);

  assertArrayEquals(['\n', '\\n'], expose`
${x}\n`[0].raw);
  assertArrayEquals(['\n', '\n'], expose`
${x}\n`[0]);

  // These contains the ES new line chars \u2028 and \u2029
  assertArrayEquals(['\u2028', '\\u2028'], expose` ${x}\u2028`[0].raw);
  assertArrayEquals(['\u2028', '\u2028'], expose` ${x}\u2028`[0]);

  assertArrayEquals(['\u2029', '\\u2029'], expose` ${x}\u2029`[0].raw);
  assertArrayEquals(['\u2029', '\u2029'], expose` ${x}\u2029`[0]);

  assertArrayEquals(['a/*b*/c'], expose`a/*b*/c`[0].raw);
  assertArrayEquals(['a/*b*/c'], expose`a/*b*/c`[0]);

  assertArrayEquals(['a'], expose/* comment */`a`[0].raw);
  assertArrayEquals(['a'], expose/* comment */`a`[0]);

}

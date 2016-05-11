// Options: --block-binding

{
  function expose(callSite, var_args) {
    assert.isTrue(Array.isArray(callSite));
    assert.isTrue(Object.isFrozen(callSite));
    var rawDescr = Object.getOwnPropertyDescriptor(callSite, 'raw');
    assert.isTrue(rawDescr !== undefined);
    assert.isTrue('value' in rawDescr);
    assert.isFalse(rawDescr.enumerable);
    assert.isFalse(rawDescr.writable);
    assert.isFalse(rawDescr.configurable);
    assert.isTrue(Object.isFrozen(callSite.raw));
    assert.isTrue(Array.isArray(callSite.raw));
    assert.isTrue(Object.isFrozen(callSite.raw));
    assert.equal(callSite.raw.length, callSite.length);

    // The number of the literal portions is always same or one greater than the
    // number of substitutions
    var literalPortionCount = callSite.raw.length;
    var substitutionCount = arguments.length - 1;
    assert.isTrue(literalPortionCount == substitutionCount ||
               literalPortionCount == substitutionCount + 1);

    return arguments;
  }

  let x = 3;
  let y = 5;

  assert.equal(1, expose``.length);
  assert.equal(1, expose`a`.length);
  assert.equal(2, expose`a${x}`.length);
  assert.equal(2, expose`a${x} b`.length);
  assert.equal(3, expose`a${x} ${y}`.length);
  assert.equal(3, expose`${x}${y}`.length);
  assert.equal(2, expose`${x}a`.length);

  assert.equal(1, expose``[0].length);
  assert.equal(1, expose``[0].raw.length);

  assert.deepEqual(['a'], expose`a`[0].raw);
  assert.deepEqual(['a'], expose`a`[0]);

  assert.deepEqual(['\\n'], expose`\n`[0].raw);
  assert.deepEqual(['\n'], expose`\n`[0]);

  assert.deepEqual(['\\r'], expose`\r`[0].raw);
  assert.deepEqual(['\r'], expose`\r`[0]);

  assert.deepEqual(['\\f'], expose`\f`[0].raw);
  assert.deepEqual(['\f'], expose`\f`[0]);

  assert.deepEqual(['\\b'], expose`\b`[0].raw);
  assert.deepEqual(['\b'], expose`\b`[0]);

  assert.deepEqual(['\\u2028'], expose`\u2028`[0].raw);
  assert.deepEqual(['\u2028'], expose`\u2028`[0]);

  assert.deepEqual(['\\u2029'], expose`\u2029`[0].raw);
  assert.deepEqual(['\u2029'], expose`\u2029`[0]);

  assert.deepEqual(['a', 'b'], expose`a${x}b`[0].raw);
  assert.deepEqual(['a', 'b'], expose`a${x}b`[0]);

  // These have tab characters in them.
  assert.deepEqual(['\t', '\\t'], expose`	${x}\t`[0].raw);
  assert.deepEqual(['\t', '\t'], expose`	${x}\t`[0]);

  assert.deepEqual(['\n', '\\n'], expose`
${x}\n`[0].raw);
  assert.deepEqual(['\n', '\n'], expose`
${x}\n`[0]);

  // These contains the ES new line chars \u2028 and \u2029
  assert.deepEqual(['\u2028', '\\u2028'], expose` ${x}\u2028`[0].raw);
  assert.deepEqual(['\u2028', '\u2028'], expose` ${x}\u2028`[0]);

  assert.deepEqual(['\u2029', '\\u2029'], expose` ${x}\u2029`[0].raw);
  assert.deepEqual(['\u2029', '\u2029'], expose` ${x}\u2029`[0]);

  assert.deepEqual(['a/*b*/c'], expose`a/*b*/c`[0].raw);
  assert.deepEqual(['a/*b*/c'], expose`a/*b*/c`[0]);

  assert.deepEqual(['a'], expose/* comment */`a`[0].raw);
  assert.deepEqual(['a'], expose/* comment */`a`[0]);
}

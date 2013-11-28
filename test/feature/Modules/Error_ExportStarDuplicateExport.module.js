// Should not compile.
// Error: :6:8: Duplicate export of 'a'
// Error: :5:8: 'a' was previously exported here

export * from './resources/a';
export * from './resources/a2';

assert.equal(1, 2);

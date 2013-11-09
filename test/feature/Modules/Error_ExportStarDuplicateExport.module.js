// Should not compile.
// Error: :6:8: Duplicate export declaration 'a'
// Error: :5:8: Location related to previous error

export * from './resources/a';
export * from './resources/a2';

assert.equal(1, 2);

// Should not compile.
// Error: initializer is not allowed in for-of loop with pattern
// Error: for-of statement may not have initializer

for (var {k} = {} of []) {
}

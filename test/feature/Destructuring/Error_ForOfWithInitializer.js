// Should not compile.
// Error: initialiser is not allowed in for-of loop with pattern
// Error: for-of statement may not have initialiser

for (var {k} = {} of []) {
}

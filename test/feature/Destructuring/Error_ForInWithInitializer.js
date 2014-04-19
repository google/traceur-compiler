// Should not compile.
// Error: initializer is not allowed in for-in loop with pattern

for (var {k} = {} in {}) {
}

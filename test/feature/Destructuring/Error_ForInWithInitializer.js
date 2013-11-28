// Should not compile.
// Error: initialiser is not allowed in for-in loop with pattern

for (var {k} = {} in {}) {
}

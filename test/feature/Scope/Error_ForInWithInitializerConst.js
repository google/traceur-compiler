// Should not compile.
// Options: --block-binding
// Error: let/const in for-in statement may not have initializer

for (const i = 0 in {}) {
}

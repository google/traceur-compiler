// Should not compile.
// Options: --block-binding
// Error: :5:18: Unexpected token in

for (const i = 0 in {}) {
}

// Options: --strong-mode
// Error: :6:1: Strict mode code may not include a with statement

'use strong'

with ({}) {}

// Should not compile.
// Error: 5:18: unexpected token .

module 'a' {}
module b from 'a'.c;
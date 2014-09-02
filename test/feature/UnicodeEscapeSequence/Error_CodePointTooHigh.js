// Should not compile.
// Options: --unicode-escape-sequences
// Error: :5:12: The code point in a Unicode escape sequence cannot exceed 10FFFF

"\u{1000000}";

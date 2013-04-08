// Should not compile.
// Options: --strict-semicolons
// Error: 34:1: Semi-colon expected

//:this is a nolint error test.
// It is identical to StrictSemiColonsNoLint.js except for one missing
// semicolon.

// Note: The leading letter in the var names changes for each expected
// transition between lint and nolint.
var a0;
var a1;
//:nolint
var b2
//:nolint These don't nest (should they?).
var b3
// hello lint
var b4
var b5
var b6;
var b7
var b8
//:lint
//:nolint
var c1
var c2
//:hello lint
var c3
var c4
; // Necessary for nolint-to-lint transitions.
//:lint
var d1 // <<< missing semicolon here. The error location is at the next token.
//:lint
var d2;

// Should not compile.
// Options: --strict-semicolons
// Error: 21:1: Semi-colon expected
// Error: 38:1: Semi-colon expected
// Error: 44:1: Semi-colon expected
// Error: 51:1: Semi-colon expected
// Error: 61:1: Semi-colon expected

//:this is a nolint error test.
// It is identical to StrictSemiColonsNoLint.js except for some missing
// semicolons. This file needs to end in a newline in order for the line
// number of the last error to match correctly.

// Note: The var names begin with 'N' in expected nolint zones and with 'L' in
// expected lint zones.

//:nolintnot
var L0;
var L1 // <<< missing semicolon. The error location is at the next token.
//:nolint
var N2
//:nolint These don't nest (should they?).
var N3
// hello lint
var N4
var N5;
var N6
//:lint
//:nolint
var N7
var N8
//:hello lint
var N9
var Na
//:lint
var Lb // <<< missing semicolon.
//:lint
var Lc;
//:nolint
var Nd
//:lint
var Le // <<< missing semicolon.
//:nolint
var Nf
//:lint
//:lint
var Lg // <<< missing semicolon.
//:nolint
//:nolint
//:lintnot
var Nh
//:nolint
//:lint
//:nolint
//:lint
var Li // <<< missing semicolon.
//:lint
//:nolint
//:lint
//:nolint

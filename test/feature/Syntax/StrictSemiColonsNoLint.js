// Options: --strict-semicolons

//:this is a nolint test.

// Note: The var names begin with 'N' in expected nolint zones and with 'L' in
// expected lint zones.

//:nolintnot
var L0;
var L1;
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
var Lb;
//:lint
var Lc;
//:nolint
var Nd
//:lint
var Le;
//:nolint
var Nf
//:lint
//:lint
var Lg;
//:nolint
//:nolint
//:lintnot
var Nh
//:nolint
//:lint
//:nolint
//:lint
var Li;
//:lint
//:nolint
//:lint
//:nolint

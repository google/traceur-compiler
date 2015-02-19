// Options: --strong-mode
// Error: :13:5: var is not allowed in strong mode. Please use let or const instead.
// Error: :14:10: var is not allowed in strong mode. Please use let or const instead.
// Error: :15:10: var is not allowed in strong mode. Please use let or const instead.
// Error: :16:10: var is not allowed in strong mode. Please use let or const instead.
// Error: :17:10: var is not allowed in strong mode. Please use let or const instead.
// Error: :19:5: var is not allowed in strong mode. Please use let or const instead.
// Error: :20:5: var is not allowed in strong mode. Please use let or const instead.
// Error: :21:5: var is not allowed in strong mode. Please use let or const instead.

'use strong'

var a = {x: 1};
for (var b of []) {}
for (var c in {}) {}
for (var d = 0; d < 1; d++) {}
for (var e, f = 0; f < 1; f++) {}

var {g, h} = {};
var [i, ...j] = [];
var {k = {}} = {};

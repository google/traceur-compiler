// Not enabled.
'use strong'

var a = {x: 1};
for (var b of []) {}
for (var c in {}) {}
for (var d = 0; d < 1; d++) {}
for (var e, f = 0; f < 1; f++) {}

var {g, h} = {};
var [i, ...j] = [];
var {k = {}} = {};

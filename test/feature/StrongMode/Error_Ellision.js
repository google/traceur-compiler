// Options: --strong-mode
// Error: :10:16: Arrays with holes are not supported in strong mode. Please use a Map instead.
// Error: :11:10: Arrays with holes are not supported in strong mode. Please use a Map instead.
// Error: :12:13: Arrays with holes are not supported in strong mode. Please use a Map instead.
// Error: :12:15: Arrays with holes are not supported in strong mode. Please use a Map instead.

'use strong'

let a = [0, 1, 2, ];  // OK
let b = [0, 1, , ];
let c = [, 1, 2, ];
let d = [0, , , 3];
let e = [, ];

// Options: --strong-mode

'use strong'

let a = [0, 1, 2, ];
assert.equal(3, a.length);

let [, b, , c] = [0, 1, 2, 3];
assert.equal(1, b);
assert.equal(3, c);

// Not working ATM.
// let d;
// [, d] = [0, 1];
// assert.equal(1, d);

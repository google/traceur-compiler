// Options: --block-binding

let result = [];
let obj = {a : 'hello a', b : 'hello b', c : 'hello c' };
let keys = Object.keys(obj);

// NOTE: Do not fix the deviation from Google JS coding style. This was done in
// order to check codegen for single statements in the body of 'for' loops.
for (let i = 0; i < keys.length; i++)
  result.push(
    function() { return obj[keys[i]]; }
  );

// ----------------------------------------------------------------------------

assert.equal('hello a', result[0]());
assert.equal('hello b', result[1]());
assert.equal('hello c', result[2]());

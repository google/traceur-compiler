let result = [];
let obj = {a : 'hello a', b : 'hello b', c : 'hello c' };
for (let x in obj) {
  result.push(
    function() { return obj[x]; }
  );
}

// ----------------------------------------------------------------------------

assertEquals('hello a', result[0]());
assertEquals('hello b', result[1]());
assertEquals('hello c', result[2]());

let result = [];
for (let a = 1; a < 3; a++) {
  result.push(
    function() { return 'for ' + a; }
  );
}

// ----------------------------------------------------------------------------

assertEquals('for 1', result[0]());
assertEquals('for 2', result[1]());
assertEquals(2, result.length);

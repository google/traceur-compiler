var calls = 0;

var {} = calls++;
assert.equal(calls, 1);

var [] = calls++;
assert.equal(calls, 2);

var {} = calls++, [] = calls++;
assert.equal(calls, 4);


///////////////////////

calls = 0;

({} = calls++);
assert.equal(calls, 1);

[] = calls++;
assert.equal(calls, 2);

({} = calls++, [] = calls++);
assert.equal(calls, 4);

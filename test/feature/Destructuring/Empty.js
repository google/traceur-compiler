var calls = 0;

var {} = Object(calls++);
assert.equal(calls, 1);

var [] = Object(calls++);
assert.equal(calls, 2);

var {} = Object(calls++), [] = Object(calls++);
assert.equal(calls, 4);


///////////////////////

calls = 0;

({} = Object(calls++));
assert.equal(calls, 1);

[] = Object(calls++);
assert.equal(calls, 2);

({} = Object(calls++), [] = Object(calls++));
assert.equal(calls, 4);

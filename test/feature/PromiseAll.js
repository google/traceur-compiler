// Async.

var p = Promise.all([1,2]);

p.then((v) => {
    assert.equal(v.length, 2);
    assert.deepEqual(v, [1,2]);
    done();
});

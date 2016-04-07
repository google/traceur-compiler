// Options: --async-functions --generators=parse
// Skip !function*() {}

async function f() {
}

assert.equal(Object.getPrototypeOf(f), Function.prototype);
assert.instanceOf(f(), Promise);

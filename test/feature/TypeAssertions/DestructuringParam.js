// Options: --types=true --type-assertions --type-assertion-module=./resources/assert
function objectPattern({a, b}:Number) { return a + b; }
function objectPatternField({x: a, y: b}:Number) { return a + b; }
function computedName() { return 'z'; }
function objectPatternComputed({x, y, [computedName()]: a}:Number) { return a; }
function arrayPattern([a, b]:Number) { return a + b; }

assert.equal(3, objectPattern({a: 1, b: 2}));
assert.equal(3, objectPatternField({x: 1, y: 2}));
assert.equal(10, objectPatternComputed({x: 1, y: 2, z: 10}));
assert.equal(3, arrayPattern([1, 2]));

assert.throw(() => { objectPattern({a: 1, b: ''}); }, chai.AssertionError);
assert.throw(() => { objectPatternField({x: 1, y: ''}); },
    chai.AssertionError);
assert.throw(() => { objectPatternComputed({x: 1, y: '', z: 10}); },
    chai.AssertionError);
assert.throw(() => { arrayPattern([1, '']); }, chai.AssertionError);

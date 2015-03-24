var subs = [];
var log = [];
var tagged = [];
function getter(name, value) {
  return {
    get: function() {
      log.push('get' + name);
      return value;
    },
    set: function(v) {
      log.push('set' + name);
    }
  };
}
Object.defineProperties(subs, {
  0: getter(0, 1),
  1: getter(1, 2),
  2: getter(2, 3)
});
function tag(cs) {
  var substitutions = arguments.length - 1;
  var cooked = cs.length;
  var e = cs[0];
  var i = 0;
  assert.equal(cooked, substitutions + 1);
  while (i < substitutions) {
    var sub = arguments[i++ + 1];
    var tail = cs[i];
    tagged.push(sub);
    e = e.concat(sub, tail);
  }
  return e;
}
assert.equal('-1-2-3-', tag`-${subs[0]}-${subs[1]}-${subs[2]}-`);
assert.deepEqual(['get0', 'get1', 'get2'], log);
assert.deepEqual([1, 2, 3], tagged);
tagged.length = 0;
log.length = 0;
assert.equal('-1-', tag`-${subs[0]}-`);
assert.deepEqual(['get0'], log);
assert.deepEqual([1], tagged);

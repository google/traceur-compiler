var subs = [];
var log = [];
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
  0: getter(0, 'a'),
  1: getter(1, 'b'),
  2: getter(2, 'c')
});
assert.equal('-a-b-c-', `-${subs[0]}-${subs[1]}-${subs[2]}-`);
assert.deepEqual(['get0', 'get1', 'get2'], log);

import {WeakMap as WeakMapPF} from '../../src/runtime/polyfills/WeakMap.js';

function test(ctor) {
  var wm = new ctor();
  var o1 = {};
  var o2 = {};
  wm.set(o1, 42);
  assert.equal(42, wm.get(o1));
  assert.isTrue(wm.has(o1));
  assert.equal(undefined, wm.get(o2));
  assert.isFalse(wm.has(o2));
  assert.isTrue(wm.delete(o1));
  assert.isFalse(wm.has(o1));
  assert.isFalse(wm.delete(o1));

  var nonObjects = ['a', true, false, 42, null, undefined];

  for (var x of nonObjects) {
    assert.throws(() => {
      wm.set(x, o1)
    }, TypeError);

    assert.throws(() => {
      wm.get(x)
    }, TypeError);

    assert.throws(() => {
      wm.has(x)
    }, TypeError);

    assert.throws(() => {
      wm.delete(x)
    }, TypeError);
  }
}

test(WeakMap);
test(WeakMapPF);

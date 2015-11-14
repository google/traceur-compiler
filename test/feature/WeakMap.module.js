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

  var f1 = Object.freeze({});
  var f2 = Object.freeze({});
  wm.set(f1, 42);
  assert.equal(42, wm.get(f1));
  assert.isTrue(wm.has(f1));
  assert.equal(undefined, wm.get(f2));
  assert.isFalse(wm.has(o2));
  assert.isTrue(wm.delete(f1));
  assert.isFalse(wm.has(f1));
  assert.isFalse(wm.delete(f1));

  var nonObjects = ['a', true, false, 42, null, undefined];

  for (var x of nonObjects) {
    assert.throws(() => {
      wm.set(x, o1)
    }, TypeError);

    assert.equal(wm.get(x), undefined);
    assert.isFalse(wm.has(x));
    assert.isFalse(wm.delete(x));
  }
}

test(WeakMap);
test(WeakMapPF);

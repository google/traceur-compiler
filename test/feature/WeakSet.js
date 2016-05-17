import {WeakSet as WeakSetPF} from '../../src/runtime/polyfills/WeakSet.js';

function test(ctor) {
  var ws = new ctor();
  var o1 = {};
  var o2 = {};
  ws.add(o1);
  assert.isTrue(ws.has(o1));
  assert.isFalse(ws.has(o2));
  assert.isTrue(ws.delete(o1));
  assert.isFalse(ws.has(o1));
  assert.isFalse(ws.delete(o1));

  var f1 = Object.freeze({});
  var f2 = Object.freeze({});
  ws.add(f1);
  assert.isTrue(ws.has(f1));
  assert.isFalse(ws.has(f2));
  assert.isTrue(ws.delete(f1));
  assert.isFalse(ws.has(f1));
  assert.isFalse(ws.delete(f1));

  var nonObjects = ['a', true, false, 42, null, undefined];

  for (var x of nonObjects) {
    assert.throws(() => {
      ws.add(x)
    }, TypeError);

    assert.isFalse(ws.has(x));
    assert.isFalse(ws.delete(x));
  }
}

test(WeakSet);
test(WeakSetPF);

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

  var nonObjects = ['a', true, false, 42, null, undefined];

  for (var x of nonObjects) {
    assert.throws(() => {
      ws.add(x)
    }, TypeError);

    assert.throws(() => {
      ws.has(x)
    }, TypeError);

    assert.throws(() => {
      ws.delete(x)
    }, TypeError);
  }
}

test(WeakSet);
test(WeakSetPF);

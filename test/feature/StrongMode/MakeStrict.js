// Options: --strong-mode

'use strong';

const obj = {
  get x() {}
}

function f() {
  assert.throws(() => {
    obj.x = 1;
  });
}
f();

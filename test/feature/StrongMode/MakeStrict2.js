// Options: --strong-mode

const obj = {
  get x() {}
}

function f() {
  'use strong';
  assert.throws(() => {
    obj.x = 1;
  });
}
f();

function g() {
  function h() {
    'use strong';
    assert.throws(() => {
      obj.x = 1;
    });
  }
  h();
}
g();

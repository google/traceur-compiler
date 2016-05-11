class MyClassName {
  m() {
    throw new Error();
  }
}

try {
  new MyClassName().m();
  assert.fail('Should have thrown');
} catch (ex) {
  if (ex.stack)
    assert.isTrue(String(ex.stack).indexOf('MyClassName') >= 0);
}

//////////////////////////////////////////////////////////////////////////////

class MySecondClass extends MyClassName{
  m() {
    throw new Error();
  }
}

try {
  new MySecondClass().m();
  assert.fail('Should have thrown');
} catch (ex) {
  if (ex.stack)
    assert.isTrue(String(ex.stack).indexOf('MySecondClass') >= 0);
}

class C {
  constructor({message: [head, ...tail], name}) {
    assert.equal('a', head);
    assertArrayEquals(['b', 'c'], tail);
    assert.equal('Error', name);
  }

  method({message: [head, ...tail], name}) {
    assert.equal('a', head);
    assertArrayEquals(['b', 'c'], tail);
    assert.equal('Error', name);
  }

  set x({message: [head, ...tail], name}) {
    assert.equal('a', head);
    assertArrayEquals(['b', 'c'], tail);
    assert.equal('Error', name);
  }
}

var c = new C(new Error('abc'));
c.method(new Error('abc'));
c.x = new Error('abc');

var object = {
  set x({message: [head, ...tail], name}) {
    assert.equal('a', head);
    assertArrayEquals(['b', 'c'], tail);
    assert.equal('Error', name);
  }
};

object.x = new Error('abc');

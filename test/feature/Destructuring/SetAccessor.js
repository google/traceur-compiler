var object = {
  set x({message: [head, ...tail], name}) {
    assertEquals('a', head);
    assertArrayEquals(['b', 'c'], tail);
    assertEquals('Error', name);
  }
};

object.x = new Error('abc');

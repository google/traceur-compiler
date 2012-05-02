var object = {
  method({message: [head, ...tail], name}) {
    assertEquals('a', head);
    assertArrayEquals(['b', 'c'], tail);
    assertEquals('Error', name);
  }
};

object.method(new Error('abc'));

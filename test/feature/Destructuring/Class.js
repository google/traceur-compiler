class C {
  constructor({message: [head, ...tail], name}) {
    assertEquals('a', head);
    assertArrayEquals(['b', 'c'], tail);
    assertEquals('Error', name);
  }

  method({message: [head, ...tail], name}) {
    assertEquals('a', head);
    assertArrayEquals(['b', 'c'], tail);
    assertEquals('Error', name);
  }

  set x({message: [head, ...tail], name}) {
    assertEquals('a', head);
    assertArrayEquals(['b', 'c'], tail);
    assertEquals('Error', name);
  }
}

var c = new C(new Error('abc'));
c.method(new Error('abc'));
c.x = new Error('abc');
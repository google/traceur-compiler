function MyError(s) {
  this.message = new String(s);
  this.name = 'Error';
}

var object = {
  set x({message: [head, ...tail], name}) {
    assert.equal('a', head);
    assert.deepEqual(['b', 'c'], tail);
    assert.equal('Error', name);
  }
};

object.x = new MyError('abc');

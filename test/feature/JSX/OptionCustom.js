// Options: --jsx=a.b

let a = {
  b(n, p) {
    assert.equal('p', n);
    assert.equal(p, null);
  }
};
<p/>;

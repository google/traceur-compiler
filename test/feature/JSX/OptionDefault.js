// Options: --jsx

let React = {
  createElement(n, p) {
    assert.equal('p', n);
    assert.equal(p, null);
  }
};
<p/>;

// Options: --jsx=f

let f = (tag, props, ...children) => {
  return children;
};

class C {
  m() {
    return <a> x {this} y </a>;
  }
  n() {
    return <a> x {} y </a>;
  }
  o() {
    return <a> x {}{} y </a>;
  }
  p() {
    return <a b={this}/>;
  }
}

const c = new C();
assert.deepEqual([' x ', c, ' y '], c.m());
assert.deepEqual([' x ', ' y '], c.n());
assert.deepEqual([' x ', ' y '], c.o());

f = (tag, props, ...children) => {
  return props;
};
assert.deepEqual({b: c}, c.p());

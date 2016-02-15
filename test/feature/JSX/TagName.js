// Options: --jsx=f

let log = []

function f(tagName) {
  log.push(tagName);
}

<a/>;
<b></b>;
<c><d></d><e/><f></f></c>;

assert.deepEqual(['a', 'b', 'd', 'e', 'f', 'c'], log);

let o = {
  p: {
    q: 'q'
  }
};

log = [];

<o/>;
<o.p></o.p>;
<o.p.q/>;

assert.deepEqual(['o', o.p, o.p.q], log);

log = [];

<a-a/>;
<b-b.toString/>;

assert.deepEqual(['a-a', String.prototype.toString], log);

const A = {a: 1};
const Bb = {b: 2};

log = [];

<A/>;
<Bb/>;

assert.deepEqual([A, Bb], log);

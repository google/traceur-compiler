module 'm' {
  export var x = 1;
  export var y = 2;
}

import {x as renamedX, y} from 'm';
import {x} from 'm';
module m2 from 'm';

assert.equal(1, x);
assert.equal(1, renamedX);
assert.equal(2, y);

module m from 'm';

assert.equal(x, renamedX);
assert.equal(x, m.x);

module m2 from 'm';

assert.isTrue(m === m2);
assert.equal(y, m.y);

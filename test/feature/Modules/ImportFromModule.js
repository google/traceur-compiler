import {a as renamedX, b} from './resources/m';
import {a} from './resources/m';
module m2 from './resources/m';

assert.equal(1, a);
assert.equal(1, renamedX);
assert.equal(2, b);

module m from './resources/m';

assert.equal(a, renamedX);
assert.equal(a, m.a);

module m3 from './resources/m';

assert.isTrue(m === m3);
assert.equal(b, m.b);

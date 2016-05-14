// Options: --export-from-extended

import {a, b, default as C} from './resources/export-forward-default-as.js';
import {new as n} from './resources/export-extended-keyword.js';

assert.equal(42, a);
assert.equal(123, b());
assert.equal('m', new C().m());
assert.equal('default', n);

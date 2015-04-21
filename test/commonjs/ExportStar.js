import {Foo} from './deps/export-star.js';

assert.equal('Foo from foo.js', Foo);
assert(typeof Bar === 'undefined');

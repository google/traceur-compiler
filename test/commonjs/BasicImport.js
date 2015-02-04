import {Foo} from './deps/foo.js';

assert.equal('Foo from foo.js', Foo);
assert(typeof Bar === 'undefined');

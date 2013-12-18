import {Foo, Bar, Baz} from './deps/foo';

assert.equal('Foo from foo.js', Foo);
assert.equal('Bar from foo.js', Bar);
assert.equal('Baz from foo.js', Baz);

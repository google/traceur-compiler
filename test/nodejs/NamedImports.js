import {Foo as f, Bar as b, Baz} from './deps/foo';

assert.equal('Foo from foo.js', f);
assert.equal('Bar from foo.js', b);
assert.equal('Baz from foo.js', Baz);

import {Foo} from './foo';

export var Bar = 'Bar from bar.js';

assert.equal('Foo from foo.js', Foo);

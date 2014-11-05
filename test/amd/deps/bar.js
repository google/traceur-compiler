import {Foo} from './foo.js';

export var Bar = 'Bar from bar.js';

assert.equal('Foo from foo.js', Foo);

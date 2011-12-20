module a from 'test_a.js';
module b from 'test_b.js';
module c from 'test_c.js';

export {name: a} from a;
export {name: b} from b;
export {name: c} from c;

export var name = 'test';

module a from './test_a.js';
module b from './test_b.js';
module c from './test_c.js';

export {name as a} from a;
export {name as b} from b;
export {name as c} from c;

export var name = 'test';

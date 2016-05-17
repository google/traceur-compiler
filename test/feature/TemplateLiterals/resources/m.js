
import {assert} from '../../../asserts.js';
import {f} from './f.js';

assert.equal('a', (f `a`)[0][0]);

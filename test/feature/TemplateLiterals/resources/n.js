import {assert} from '../../../asserts.js';
import {f} from './f.js';

assert.equal('b', (f `b`)[0][0]);

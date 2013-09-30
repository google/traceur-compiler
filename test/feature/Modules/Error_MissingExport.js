// Should not compile.
// Error: :13:12: 'y' is not exported by '
// Error: :13:15: 'z' is not exported by '
// Error: :14:9: 'w' is not exported by '
// Error: :16:9: 'foo' is not exported by '@name'
// Error: :17:9: 'bar' is not exported by '@name'
// Error: :17:14: 'baz' is not exported by '@name'

module 'm' {
  export var x = 42;
}

import {x, y, z} from 'm';
import {w} from 'm';

import {foo} from '@name';
import {bar, baz} from '@name';

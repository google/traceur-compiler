// Should not compile.
// Error: :14:12: 'y' is not exported by m
// Error: :14:15: 'z' is not exported by m
// Error: :15:9: 'w' is not exported by m
// Error: :17:9: 'foo' is not exported by '@name'
// Error: :18:9: 'bar' is not exported by '@name'
// Error: :18:14: 'baz' is not exported by '@name'
// Error: :28:17: 'object' is not a module

module m {
  export var x = 42;
}

import {x, y, z} from m;
import {w} from m;

import {foo} from '@name';
import {bar, baz} from '@name';

module outer {
  module inner {
    export var v = 1;
  }
  export var object = {v: 2};
}

var object = outer.object;
import {v} from object;

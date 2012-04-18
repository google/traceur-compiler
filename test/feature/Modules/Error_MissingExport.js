// Should not compile.
// Error: 'y' is not exported by m
// Error: 'z' is not exported by m
// Error: 'w' is not exported by m
// Error: 'foo' is not exported by '@name'
// Error: 'bar' is not exported by '@name'
// Error: 'inner' is not exported by outer
// Error: 'object' is not a module

module m {
  export var x = 42;
}

import {x, y, z} from m;
import w from m;

import foo from '@name';
import {bar, baz} from '@name';

module outer {
  module inner {
    export var v = 1;
  }
  export var object = {v: 2};
}

import v from outer.inner;
import v from outer.object;

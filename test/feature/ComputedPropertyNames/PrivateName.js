// Options: --private-names

import {Name} from '@name';

var n = new Name;

var object = {
  [n]: 42
};

assert(object[n], 42);

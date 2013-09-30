module m {
  export var x = 1;
  export var y = 2;
}

import * from m;
assert.equal(3, x + y);
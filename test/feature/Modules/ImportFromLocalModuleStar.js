module m {
  export var x = 1;
  export var y = 2;
}

import * from m;
assertEquals(3, x + y);
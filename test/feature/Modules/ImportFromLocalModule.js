module m {
  export var x = 1;
  export var y = 2;
}

import {x: renamedX, y} from m;
import x from m;
module m2 from m;

assertEquals(1, x);
assertEquals(1, renamedX);
assertEquals(2, y);

assertEquals(x, renamedX);
assertEquals(x, m.x);
// Closure tests cannot handle Object.create(null)
assertTrue(m === m2);
assertEquals(y, m.y);

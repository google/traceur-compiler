module m2 {
  var z = 'z';
  export {z as var};
}

module m {
  import {var as x} from m2;  
  export x;
}

assert.equal(m.x, 'z');

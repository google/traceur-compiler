/*
Becomes:

System.register([], function($__export) {
  "use strict";
  var a,
      b,
      c,
      d,
      e;
  function reassign() {
    $__export("a", a = 10);
  }
  $__export("reassign", reassign);
  return {
    setters: [],
    execute: function() {
      a = $__export("a", 4);
      b = $__export("b", 5 + 1);
      c = $__export("c", typeof a);
      d = $__export("d", ($__export("a", a + 1), a++));
      e = $__export("e", $__export("a", ++a));
      $__export('default', $__export("a", --a));
      $__export("a", a -= 10);
      $__export("a", --a);
    }
  };
});

*/

export var a = 4;
export var b = 5 + 1;
export var c = typeof a;
export var d = a++;
export var e = ++a;
export default --a;

a -= 10;

a--;

export function reassign() {
  a = 10;
}
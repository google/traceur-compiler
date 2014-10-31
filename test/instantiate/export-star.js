/*
  Becomes:

System.register(["./export-reassignment"], function($__export) {
  "use strict";
  $__exportNames = {
    "b": true
  };
  return {
    setters: [function(m) {
      Object.keys(m).forEach(function(p) {
        if (!$__exportNames[p])
          $__export(p, m[p]);
      });
    }],
    execute: function() {
      b = $__export("b", "localvalue");
    }
  };
});
*/
export var b = 'localvalue';
export * from './export-reassignment.js';

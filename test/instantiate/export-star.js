/*
  Becomes:

System.register(["./export-reassignment"], function($__export) {
  "use strict";
  return {
    setters: [function(m) {
      Object.keys(m).forEach(function(p) {
        $__export(p, m[p]);
      });
    }],
    execute: function() {}
  };
});
*/
export * from './export-reassignment';
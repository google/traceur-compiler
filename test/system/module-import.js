/*
Becomes:

System.register(["./export-reassignment"], function($__export) {
  "use strict";
  var M;
  return {
    setters: [function(m) {
      M = m;
    }],
    execute: function() {
      $__export('default', M.a);
    }
  };
});
*/

import * as M from './export-reassignment.js';
export default M.a;
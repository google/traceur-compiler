(function(global) {
  global.sandwich = global.aGlobal + ' pastrami';
}(typeof window != 'undefined' ? window : (typeof WorkerGlobalScope != 'undefined' ? self : global)));

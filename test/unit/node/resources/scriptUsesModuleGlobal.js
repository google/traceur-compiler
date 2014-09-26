(function(global) {
  global.sandwich = global.aGlobal + ' pastrami';
}(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this));


this.CLOSURE_IMPORT_SCRIPT =(function(global) { 
  return function(src) { 
    global['importScripts'](src); 
    return true; 
  }; 
})(this); 


goog.provide('goog.debug.Error'); 
goog.debug.Error = function(opt_msg) { 
  this.stack = new Error().stack || ''; 
  if(opt_msg) { 
    this.message = String(opt_msg); 
  } 
}; 
goog.inherits(goog.debug.Error, Error); 
goog.debug.Error.prototype.name = 'CustomError'; 

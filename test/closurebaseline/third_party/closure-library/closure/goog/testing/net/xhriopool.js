
goog.provide('goog.testing.net.XhrIoPool'); 
goog.require('goog.net.XhrIoPool'); 
goog.require('goog.testing.net.XhrIo'); 
goog.testing.net.XhrIoPool = function(opt_xhr) { 
  this.xhr_ = opt_xhr || new goog.testing.net.XhrIo(); 
  goog.base(this, undefined, 1, 1); 
}; 
goog.inherits(goog.testing.net.XhrIoPool, goog.net.XhrIoPool); 
goog.testing.net.XhrIoPool.prototype.createObject = function() { 
  return((this.xhr_)); 
}; 
goog.testing.net.XhrIoPool.prototype.getXhr = function() { 
  return this.xhr_; 
}; 

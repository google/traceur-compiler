
goog.provide('goog.net.XhrIoPool'); 
goog.require('goog.net.XhrIo'); 
goog.require('goog.structs'); 
goog.require('goog.structs.PriorityPool'); 
goog.net.XhrIoPool = function(opt_headers, opt_minCount, opt_maxCount) { 
  goog.structs.PriorityPool.call(this, opt_minCount, opt_maxCount); 
  this.headers_ = opt_headers; 
}; 
goog.inherits(goog.net.XhrIoPool, goog.structs.PriorityPool); 
goog.net.XhrIoPool.prototype.createObject = function() { 
  var xhrIo = new goog.net.XhrIo(); 
  var headers = this.headers_; 
  if(headers) { 
    goog.structs.forEach(headers, function(value, key) { 
      xhrIo.headers.set(key, value); 
    }); 
  } 
  return xhrIo; 
}; 
goog.net.XhrIoPool.prototype.disposeObject = function(obj) { 
  obj.dispose(); 
}; 
goog.net.XhrIoPool.prototype.objectCanBeReused = function(obj) { 
  return ! obj.isDisposed() && ! obj.isActive(); 
}; 

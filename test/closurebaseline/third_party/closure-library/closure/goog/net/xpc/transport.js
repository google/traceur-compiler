
goog.provide('goog.net.xpc.Transport'); 
goog.require('goog.Disposable'); 
goog.require('goog.net.xpc'); 
goog.net.xpc.Transport = function(opt_domHelper) { 
  goog.Disposable.call(this); 
  this.domHelper_ = opt_domHelper || goog.dom.getDomHelper(); 
}; 
goog.inherits(goog.net.xpc.Transport, goog.Disposable); 
goog.net.xpc.Transport.prototype.transportType = 0; 
goog.net.xpc.Transport.prototype.getType = function() { 
  return this.transportType; 
}; 
goog.net.xpc.Transport.prototype.getWindow = function() { 
  return this.domHelper_.getWindow(); 
}; 
goog.net.xpc.Transport.prototype.getName = function() { 
  return goog.net.xpc.TransportNames[this.transportType]|| ''; 
}; 
goog.net.xpc.Transport.prototype.transportServiceHandler = goog.abstractMethod; 
goog.net.xpc.Transport.prototype.connect = goog.abstractMethod; 
goog.net.xpc.Transport.prototype.send = goog.abstractMethod; 

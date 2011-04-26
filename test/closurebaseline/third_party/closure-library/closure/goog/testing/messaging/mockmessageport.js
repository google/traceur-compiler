
goog.provide('goog.testing.messaging.MockMessagePort'); 
goog.require('goog.events.EventTarget'); 
goog.testing.messaging.MockMessagePort = function(id, mockControl) { 
  goog.base(this); 
  this.id = id; 
  this.started = false; 
  this.closed = false; 
  mockControl.createMethodMock(this, 'postMessage'); 
}; 
goog.inherits(goog.testing.messaging.MockMessagePort, goog.events.EventTarget); 
goog.testing.messaging.MockMessagePort.prototype.postMessage = function(message, opt_ports) { }; 
goog.testing.messaging.MockMessagePort.prototype.start = function() { 
  this.started = true; 
}; 
goog.testing.messaging.MockMessagePort.prototype.close = function() { 
  this.closed = true; 
}; 

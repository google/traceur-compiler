
goog.provide('goog.testing.messaging.MockMessageChannel'); 
goog.require('goog.messaging.AbstractChannel'); 
goog.require('goog.testing.asserts'); 
goog.testing.messaging.MockMessageChannel = function(mockControl) { 
  goog.base(this); 
  this.disposed = false; 
  mockControl.createMethodMock(this, 'send'); 
}; 
goog.inherits(goog.testing.messaging.MockMessageChannel, goog.messaging.AbstractChannel); 
goog.testing.messaging.MockMessageChannel.prototype.send = function(serviceName, payload) { }; 
goog.testing.messaging.MockMessageChannel.prototype.dispose = function() { 
  this.disposed = true; 
}; 
goog.testing.messaging.MockMessageChannel.prototype.receive = function(serviceName, payload) { 
  this.deliver(serviceName, payload); 
}; 

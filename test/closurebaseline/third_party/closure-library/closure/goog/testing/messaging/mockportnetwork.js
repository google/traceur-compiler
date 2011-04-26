
goog.provide('goog.testing.messaging.MockPortNetwork'); 
goog.require('goog.messaging.PortNetwork'); 
goog.require('goog.testing.messaging.MockMessageChannel'); 
goog.testing.messaging.MockPortNetwork = function(mockControl) { 
  this.mockControl_ = mockControl; 
  this.ports_ = { }; 
}; 
goog.testing.messaging.MockPortNetwork.prototype.dial = function(name) { 
  if(!(name in this.ports_)) { 
    this.ports_[name]= new goog.testing.messaging.MockMessageChannel(this.mockControl_); 
  } 
  return this.ports_[name]; 
}; 

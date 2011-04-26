
goog.provide('goog.messaging.DeferredChannel'); 
goog.require('goog.async.Deferred'); 
goog.require('goog.messaging.MessageChannel'); 
goog.messaging.DeferredChannel = function(deferredChannel) { 
  this.deferred_ = deferredChannel; 
}; 
goog.messaging.DeferredChannel.prototype.cancel = function() { 
  this.deferred_.cancel(); 
}; 
goog.messaging.DeferredChannel.prototype.connect = function(opt_connectCb) { 
  if(opt_connectCb) { 
    opt_connectCb(); 
  } 
}; 
goog.messaging.DeferredChannel.prototype.isConnected = function() { 
  return true; 
}; 
goog.messaging.DeferredChannel.prototype.registerService = function(serviceName, callback, opt_objectPayload) { 
  this.deferred_.addCallback(function(resolved) { 
    resolved.registerService(serviceName, callback, opt_objectPayload); 
  }); 
}; 
goog.messaging.DeferredChannel.prototype.registerDefaultService = function(callback) { 
  this.deferred_.addCallback(function(resolved) { 
    resolved.registerDefaultService(callback); 
  }); 
}; 
goog.messaging.DeferredChannel.prototype.send = function(serviceName, payload) { 
  this.deferred_.addCallback(function(resolved) { 
    resolved.send(serviceName, payload); 
  }); 
}; 

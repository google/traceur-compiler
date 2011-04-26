
goog.provide('goog.messaging.MessageChannel'); 
goog.messaging.MessageChannel = function() { }; 
goog.messaging.MessageChannel.prototype.connect = function(opt_connectCb) { }; 
goog.messaging.MessageChannel.prototype.isConnected = function() { }; 
goog.messaging.MessageChannel.prototype.registerService = function(serviceName, callback, opt_objectPayload) { }; 
goog.messaging.MessageChannel.prototype.registerDefaultService = function(callback) { }; 
goog.messaging.MessageChannel.prototype.send = function(serviceName, payload) { }; 

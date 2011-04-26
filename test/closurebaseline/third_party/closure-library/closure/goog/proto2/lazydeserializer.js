
goog.provide('goog.proto2.LazyDeserializer'); 
goog.require('goog.proto2.Serializer'); 
goog.require('goog.proto2.Util'); 
goog.proto2.LazyDeserializer = function() { }; 
goog.inherits(goog.proto2.LazyDeserializer, goog.proto2.Serializer); 
goog.proto2.LazyDeserializer.prototype.deserialize = function(descriptor, data) { 
  var message = descriptor.createMessageInstance(); 
  message.initializeForLazyDeserializer(this, data); 
  goog.proto2.Util.assert(message instanceof goog.proto2.Message); 
  return message; 
}; 
goog.proto2.LazyDeserializer.prototype.deserializeTo = function(message, data) { 
  throw new Error('Unimplemented'); 
}; 
goog.proto2.LazyDeserializer.prototype.deserializeField = goog.abstractMethod; 

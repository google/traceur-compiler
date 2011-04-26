
goog.provide('goog.proto2.Serializer'); 
goog.require('goog.proto2.Descriptor'); 
goog.require('goog.proto2.FieldDescriptor'); 
goog.require('goog.proto2.Message'); 
goog.require('goog.proto2.Util'); 
goog.proto2.Serializer = function() { }; 
goog.proto2.Serializer.prototype.serialize = goog.abstractMethod; 
goog.proto2.Serializer.prototype.getSerializedValue = function(field, value) { 
  if(field.isCompositeType()) { 
    return this.serialize((value)); 
  } else { 
    return value; 
  } 
}; 
goog.proto2.Serializer.prototype.deserialize = function(descriptor, data) { 
  var message = descriptor.createMessageInstance(); 
  this.deserializeTo(message, data); 
  goog.proto2.Util.assert(message instanceof goog.proto2.Message); 
  return message; 
}; 
goog.proto2.Serializer.prototype.deserializeTo = goog.abstractMethod; 
goog.proto2.Serializer.prototype.getDeserializedValue = function(field, value) { 
  if(field.isCompositeType()) { 
    return this.deserialize(field.getFieldMessageType(), value); 
  } 
  if(! field.deserializationConversionPermitted()) { 
    return value; 
  } 
  var nativeType = field.getNativeType(); 
  if(nativeType === String) { 
    if(typeof value === 'number') { 
      return String(value); 
    } 
  } else if(nativeType === Number) { 
    if(typeof value === 'string') { 
      if(/^-?[0-9]+$/.test(value)) { 
        return Number(value); 
      } 
    } 
  } 
  return value; 
}; 

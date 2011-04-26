
goog.provide('goog.proto2.PbLiteSerializer'); 
goog.require('goog.proto2.LazyDeserializer'); 
goog.require('goog.proto2.Util'); 
goog.proto2.PbLiteSerializer = function() { }; 
goog.inherits(goog.proto2.PbLiteSerializer, goog.proto2.LazyDeserializer); 
goog.proto2.PbLiteSerializer.prototype.serialize = function(message) { 
  var descriptor = message.getDescriptor(); 
  var fields = descriptor.getFields(); 
  var serialized =[]; 
  for(var i = 0; i < fields.length; i ++) { 
    var field = fields[i]; 
    if(! message.has(field)) { 
      continue; 
    } 
    var tag = field.getTag(); 
    if(field.isRepeated()) { 
      serialized[tag]=[]; 
      for(var j = 0; j < message.countOf(field); j ++) { 
        serialized[tag][j]= this.getSerializedValue(field, message.get(field, j)); 
      } 
    } else { 
      serialized[tag]= this.getSerializedValue(field, message.get(field)); 
    } 
  } 
  message.forEachUnknown(function(tag, value) { 
    serialized[tag]= value; 
  }); 
  return serialized; 
}; 
goog.proto2.PbLiteSerializer.prototype.deserializeField = function(message, field, value) { 
  if(value == null) { 
    return value; 
  } 
  if(field.isRepeated()) { 
    var data =[]; 
    goog.proto2.Util.assert(goog.isArray(value)); 
    for(var i = 0; i < value.length; i ++) { 
      data[i]= this.getDeserializedValue(field, value[i]); 
    } 
    return data; 
  } else { 
    return this.getDeserializedValue(field, value); 
  } 
}; 
goog.proto2.PbLiteSerializer.prototype.getSerializedValue = function(field, value) { 
  if(field.getFieldType() == goog.proto2.FieldDescriptor.FieldType.BOOL) { 
    return value ? 1: 0; 
  } 
  return goog.proto2.Serializer.prototype.getSerializedValue.apply(this, arguments); 
}; 
goog.proto2.PbLiteSerializer.prototype.getDeserializedValue = function(field, value) { 
  if(field.getFieldType() == goog.proto2.FieldDescriptor.FieldType.BOOL) { 
    return value === 1; 
  } 
  return goog.proto2.Serializer.prototype.getDeserializedValue.apply(this, arguments); 
}; 

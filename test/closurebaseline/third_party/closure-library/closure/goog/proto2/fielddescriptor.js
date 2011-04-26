
goog.provide('goog.proto2.FieldDescriptor'); 
goog.require('goog.proto2.Util'); 
goog.require('goog.string'); 
goog.proto2.FieldDescriptor = function(messageType, tag, metadata) { 
  this.parent_ = messageType; 
  goog.proto2.Util.assert(goog.string.isNumeric(tag)); 
  this.tag_ =(tag); 
  this.name_ = metadata.name; 
  metadata.repeated; 
  metadata.required; 
  this.isRepeated_ = ! ! metadata.repeated; 
  this.isRequired_ = ! ! metadata.required; 
  this.fieldType_ = metadata.fieldType; 
  this.nativeType_ = metadata.type; 
  this.deserializationConversionPermitted_ = false; 
  switch(this.fieldType_) { 
    case goog.proto2.FieldDescriptor.FieldType.INT64: 
    case goog.proto2.FieldDescriptor.FieldType.UINT64: 
    case goog.proto2.FieldDescriptor.FieldType.FIXED64: 
    case goog.proto2.FieldDescriptor.FieldType.SFIXED64: 
    case goog.proto2.FieldDescriptor.FieldType.SINT64: 
      this.deserializationConversionPermitted_ = true; 
      break; 

  } 
  this.defaultValue_ = metadata.defaultValue; 
}; 
goog.proto2.FieldDescriptor.FieldType = { 
  DOUBLE: 1, 
  FLOAT: 2, 
  INT64: 3, 
  UINT64: 4, 
  INT32: 5, 
  FIXED64: 6, 
  FIXED32: 7, 
  BOOL: 8, 
  STRING: 9, 
  GROUP: 10, 
  MESSAGE: 11, 
  BYTES: 12, 
  UINT32: 13, 
  ENUM: 14, 
  SFIXED32: 15, 
  SFIXED64: 16, 
  SINT32: 17, 
  SINT64: 18 
}; 
goog.proto2.FieldDescriptor.prototype.getTag = function() { 
  return this.tag_; 
}; 
goog.proto2.FieldDescriptor.prototype.getContainingType = function() { 
  return this.parent_.descriptor_; 
}; 
goog.proto2.FieldDescriptor.prototype.getName = function() { 
  return this.name_; 
}; 
goog.proto2.FieldDescriptor.prototype.getDefaultValue = function() { 
  if(this.defaultValue_ === undefined) { 
    var nativeType = this.nativeType_; 
    if(nativeType === Boolean) { 
      this.defaultValue_ = false; 
    } else if(nativeType === Number) { 
      this.defaultValue_ = 0; 
    } else if(nativeType === String) { 
      this.defaultValue_ = ''; 
    } else { 
      this.defaultValue_ = new nativeType; 
    } 
  } 
  return this.defaultValue_; 
}; 
goog.proto2.FieldDescriptor.prototype.getFieldType = function() { 
  return this.fieldType_; 
}; 
goog.proto2.FieldDescriptor.prototype.getNativeType = function() { 
  return this.nativeType_; 
}; 
goog.proto2.FieldDescriptor.prototype.deserializationConversionPermitted = function() { 
  return this.deserializationConversionPermitted_; 
}; 
goog.proto2.FieldDescriptor.prototype.getFieldMessageType = function() { 
  goog.proto2.Util.assert(this.isCompositeType(), 'Expected message or group'); 
  return this.nativeType_.descriptor_; 
}; 
goog.proto2.FieldDescriptor.prototype.isCompositeType = function() { 
  return this.fieldType_ == goog.proto2.FieldDescriptor.FieldType.MESSAGE || this.fieldType_ == goog.proto2.FieldDescriptor.FieldType.GROUP; 
}; 
goog.proto2.FieldDescriptor.prototype.isRepeated = function() { 
  return this.isRepeated_; 
}; 
goog.proto2.FieldDescriptor.prototype.isRequired = function() { 
  return this.isRequired_; 
}; 
goog.proto2.FieldDescriptor.prototype.isOptional = function() { 
  return ! this.isRepeated_ && ! this.isRequired_; 
}; 

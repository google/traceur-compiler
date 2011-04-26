
goog.provide('goog.proto2.Descriptor'); 
goog.provide('goog.proto2.Metadata'); 
goog.require('goog.array'); 
goog.require('goog.object'); 
goog.require('goog.proto2.Util'); 
goog.proto2.Metadata; 
goog.proto2.Descriptor = function(messageType, metadata, fields) { 
  this.messageType_ = messageType; 
  this.name_ = metadata.name || null; 
  this.fullName_ = metadata.fullName || null; 
  this.containingType_ = metadata.containingType; 
  this.fields_ = { }; 
  for(var i = 0; i < fields.length; i ++) { 
    var field = fields[i]; 
    this.fields_[field.getTag()]= field; 
  } 
}; 
goog.proto2.Descriptor.prototype.getName = function() { 
  return this.name_; 
}; 
goog.proto2.Descriptor.prototype.getFullName = function() { 
  return this.fullName_; 
}; 
goog.proto2.Descriptor.prototype.getContainingType = function() { 
  if(! this.containingType_) { 
    return null; 
  } 
  return this.containingType_.getDescriptor(); 
}; 
goog.proto2.Descriptor.prototype.getFields = function() { 
  function tagComparator(fieldA, fieldB) { 
    return fieldA.getTag() - fieldB.getTag(); 
  } 
  ; 
  var fields = goog.object.getValues(this.fields_); 
  goog.array.sort(fields, tagComparator); 
  return fields; 
}; 
goog.proto2.Descriptor.prototype.getFieldsMap = function() { 
  return goog.object.clone(this.fields_); 
}; 
goog.proto2.Descriptor.prototype.findFieldByName = function(name) { 
  var valueFound = goog.object.findValue(this.fields_, function(field, key, obj) { 
    return field.getName() == name; 
  }); 
  return(valueFound) || null; 
}; 
goog.proto2.Descriptor.prototype.findFieldByTag = function(tag) { 
  goog.proto2.Util.assert(goog.string.isNumeric(tag)); 
  return this.fields_[parseInt(tag, 10)]|| null; 
}; 
goog.proto2.Descriptor.prototype.createMessageInstance = function() { 
  return new this.messageType_; 
}; 

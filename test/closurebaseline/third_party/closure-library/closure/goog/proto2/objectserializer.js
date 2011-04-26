
goog.provide('goog.proto2.ObjectSerializer'); 
goog.require('goog.proto2.Serializer'); 
goog.require('goog.proto2.Util'); 
goog.require('goog.string'); 
goog.proto2.ObjectSerializer = function(opt_keyOption) { 
  this.keyOption_ = opt_keyOption; 
}; 
goog.inherits(goog.proto2.ObjectSerializer, goog.proto2.Serializer); 
goog.proto2.ObjectSerializer.KeyOption = { 
  TAG: 0, 
  NAME: 1 
}; 
goog.proto2.ObjectSerializer.prototype.serialize = function(message) { 
  var descriptor = message.getDescriptor(); 
  var fields = descriptor.getFields(); 
  var objectValue = { }; 
  for(var i = 0; i < fields.length; i ++) { 
    var field = fields[i]; 
    var key = this.keyOption_ == goog.proto2.ObjectSerializer.KeyOption.NAME ? field.getName(): field.getTag(); 
    if(message.has(field)) { 
      if(field.isRepeated()) { 
        var array =[]; 
        objectValue[key]= array; 
        for(var j = 0; j < message.countOf(field); j ++) { 
          array.push(this.getSerializedValue(field, message.get(field, j))); 
        } 
      } else { 
        objectValue[key]= this.getSerializedValue(field, message.get(field)); 
      } 
    } 
  } 
  message.forEachUnknown(function(tag, value) { 
    objectValue[tag]= value; 
  }); 
  return objectValue; 
}; 
goog.proto2.ObjectSerializer.prototype.deserializeTo = function(message, data) { 
  var descriptor = message.getDescriptor(); 
  for(var key in data) { 
    var field; 
    var value = data[key]; 
    var isNumeric = goog.string.isNumeric(key); 
    if(isNumeric) { 
      field = descriptor.findFieldByTag(key); 
    } else { 
      goog.proto2.Util.assert(this.keyOption_ == goog.proto2.ObjectSerializer.KeyOption.NAME); 
      field = descriptor.findFieldByName(key); 
    } 
    if(field) { 
      if(field.isRepeated()) { 
        goog.proto2.Util.assert(goog.isArray(value)); 
        for(var j = 0; j < value.length; j ++) { 
          message.add(field, this.getDeserializedValue(field, value[j])); 
        } 
      } else { 
        goog.proto2.Util.assert(! goog.isArray(value)); 
        message.set(field, this.getDeserializedValue(field, value)); 
      } 
    } else { 
      if(isNumeric) { 
        message.setUnknown((key), value); 
      } else { 
        goog.proto2.Util.assert(field); 
      } 
    } 
  } 
}; 

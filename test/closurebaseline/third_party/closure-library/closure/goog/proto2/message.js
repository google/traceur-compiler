
goog.provide('goog.proto2.Message'); 
goog.require('goog.proto2.Descriptor'); 
goog.require('goog.proto2.FieldDescriptor'); 
goog.require('goog.proto2.Util'); 
goog.require('goog.string'); 
goog.proto2.Message = function() { 
  this.values_ = { }; 
  this.descriptor_ = this.constructor.descriptor_; 
  this.fields_ = this.descriptor_.getFieldsMap(); 
  this.lazyDeserializer_ = null; 
  this.deserializedFields_ = null; 
}; 
goog.proto2.Message.FieldType = { 
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
goog.proto2.Message.prototype.initializeForLazyDeserializer = function(deserializer, data) { 
  this.lazyDeserializer_ = deserializer; 
  this.values_ = data; 
  this.deserializedFields_ = { }; 
}; 
goog.proto2.Message.prototype.setUnknown = function(tag, value) { 
  goog.proto2.Util.assert(! this.fields_[tag], 'Field is not unknown in this message'); 
  goog.proto2.Util.assert(tag >= 1, 'Tag is not valid'); 
  goog.proto2.Util.assert(value !== null, 'Value cannot be null'); 
  this.values_[tag]= value; 
}; 
goog.proto2.Message.prototype.forEachUnknown = function(callback, opt_scope) { 
  var scope = opt_scope || this; 
  for(var key in this.values_) { 
    if(! this.fields_[key]) { 
      callback.call(scope,(key), this.values_[key]); 
    } 
  } 
}; 
goog.proto2.Message.prototype.getDescriptor = function() { 
  return this.descriptor_; 
}; 
goog.proto2.Message.prototype.has = function(field) { 
  goog.proto2.Util.assert(field.getContainingType() == this.descriptor_, 'The current message does not contain the given field'); 
  return this.has$Value(field.getTag()); 
}; 
goog.proto2.Message.prototype.arrayOf = function(field) { 
  goog.proto2.Util.assert(field.getContainingType() == this.descriptor_, 'The current message does not contain the given field'); 
  return this.array$Values(field.getTag()); 
}; 
goog.proto2.Message.prototype.countOf = function(field) { 
  goog.proto2.Util.assert(field.getContainingType() == this.descriptor_, 'The current message does not contain the given field'); 
  return this.count$Values(field.getTag()); 
}; 
goog.proto2.Message.prototype.get = function(field, opt_index) { 
  goog.proto2.Util.assert(field.getContainingType() == this.descriptor_, 'The current message does not contain the given field'); 
  return this.get$Value(field.getTag(), opt_index); 
}; 
goog.proto2.Message.prototype.getOrDefault = function(field, opt_index) { 
  goog.proto2.Util.assert(field.getContainingType() == this.descriptor_, 'The current message does not contain the given field'); 
  return this.get$ValueOrDefault(field.getTag(), opt_index); 
}; 
goog.proto2.Message.prototype.set = function(field, value) { 
  goog.proto2.Util.assert(field.getContainingType() == this.descriptor_, 'The current message does not contain the given field'); 
  this.set$Value(field.getTag(), value); 
}; 
goog.proto2.Message.prototype.add = function(field, value) { 
  goog.proto2.Util.assert(field.getContainingType() == this.descriptor_, 'The current message does not contain the given field'); 
  this.add$Value(field.getTag(), value); 
}; 
goog.proto2.Message.prototype.clear = function(field) { 
  goog.proto2.Util.assert(field.getContainingType() == this.descriptor_, 'The current message does not contain the given field'); 
  this.clear$Field(field.getTag()); 
}; 
goog.proto2.Message.prototype.equals = function(other) { 
  if(! other || this.constructor != other.constructor) { 
    return false; 
  } 
  var fields = this.getDescriptor().getFields(); 
  for(var i = 0; i < fields.length; i ++) { 
    var field = fields[i]; 
    if(this.has(field) != other.has(field)) { 
      return false; 
    } 
    if(this.has(field)) { 
      try { 
        throw undefined; 
      } catch(fieldsEqual) { 
        var isComposite = field.isCompositeType(); 
        (fieldsEqual = function fieldsEqual(value1, value2) { 
          return isComposite ? value1.equals(value2): value1 == value2; 
        }); 
        var tag = field.getTag(); 
        var thisValue = this.values_[tag]; 
        var otherValue = other.values_[tag]; 
        if(field.isRepeated()) { 
          if(thisValue.length != otherValue.length) { 
            return false; 
          } 
          for(var j = 0; j < thisValue.length; j ++) { 
            if(! fieldsEqual(thisValue[j], otherValue[j])) { 
              return false; 
            } 
          } 
        } else if(! fieldsEqual(thisValue, otherValue)) { 
          return false; 
        } 
      } 
    } 
  } 
  return true; 
}; 
goog.proto2.Message.prototype.copyFrom = function(message) { 
  goog.proto2.Util.assert(this.constructor == message.constructor, 'The source message must have the same type.'); 
  var fields = this.getDescriptor().getFields(); 
  for(var i = 0; i < fields.length; i ++) { 
    var field = fields[i]; 
    delete this.values_[field.getTag()]; 
    if(message.has(field)) { 
      var isComposite = field.isCompositeType(); 
      if(field.isRepeated()) { 
        var values = message.arrayOf(field); 
        for(var j = 0; j < values.length; j ++) { 
          this.add(field, isComposite ? values[j].clone(): values[j]); 
        } 
      } else { 
        var value = message.get(field); 
        this.set(field, isComposite ? value.clone(): value); 
      } 
    } 
  } 
}; 
goog.proto2.Message.prototype.clone = function() { 
  var clone = new this.constructor; 
  clone.copyFrom(this); 
  return clone; 
}; 
goog.proto2.Message.prototype.initDefaults = function(simpleFieldsToo) { 
  var fields = this.getDescriptor().getFields(); 
  for(var i = 0; i < fields.length; i ++) { 
    var field = fields[i]; 
    var tag = field.getTag(); 
    var isComposite = field.isCompositeType(); 
    if(! this.has(field) && ! field.isRepeated()) { 
      if(isComposite) { 
        this.values_[tag]= new(field.getNativeType()); 
      } else if(simpleFieldsToo) { 
        this.values_[tag]= field.getDefaultValue(); 
      } 
    } 
    if(isComposite) { 
      if(field.isRepeated()) { 
        var values = this.array$Values(tag); 
        for(var j = 0; j < values.length; j ++) { 
          values[j].initDefaults(simpleFieldsToo); 
        } 
      } else { 
        this.get$Value(tag).initDefaults(simpleFieldsToo); 
      } 
    } 
  } 
}; 
goog.proto2.Message.prototype.getFieldByTag_ = function(tag) { 
  goog.proto2.Util.assert(this.fields_[tag], 'No field found for the given tag'); 
  return this.fields_[tag]; 
}; 
goog.proto2.Message.prototype.has$Value = function(tag) { 
  goog.proto2.Util.assert(this.fields_[tag], 'No field found for the given tag'); 
  return tag in this.values_ && goog.isDef(this.values_[tag]); 
}; 
goog.proto2.Message.prototype.lazyDeserialize_ = function(field) { 
  if(this.lazyDeserializer_) { 
    var tag = field.getTag(); 
    if(!(tag in this.deserializedFields_)) { 
      this.values_[tag]= this.lazyDeserializer_.deserializeField(this, field, this.values_[tag]); 
      this.deserializedFields_[tag]= true; 
    } 
  } 
}; 
goog.proto2.Message.prototype.get$Value = function(tag, opt_index) { 
  var field = this.getFieldByTag_(tag); 
  this.lazyDeserialize_(field); 
  if(field.isRepeated()) { 
    var index = opt_index || 0; 
    goog.proto2.Util.assert(index < this.count$Values(tag), 'Field value count is less than index given'); 
    return this.values_[tag][index]; 
  } else { 
    goog.proto2.Util.assert(! goog.isArray(this.values_[tag])); 
    return this.values_[tag]; 
  } 
}; 
goog.proto2.Message.prototype.get$ValueOrDefault = function(tag, opt_index) { 
  if(! this.has$Value(tag)) { 
    var field = this.getFieldByTag_(tag); 
    return field.getDefaultValue(); 
  } 
  return this.get$Value(tag, opt_index); 
}; 
goog.proto2.Message.prototype.array$Values = function(tag) { 
  goog.proto2.Util.assert(this.getFieldByTag_(tag).isRepeated(), 'Cannot call fieldArray on a non-repeated field'); 
  var field = this.getFieldByTag_(tag); 
  this.lazyDeserialize_(field); 
  return this.values_[tag]||[]; 
}; 
goog.proto2.Message.prototype.count$Values = function(tag) { 
  var field = this.getFieldByTag_(tag); 
  if(field.isRepeated()) { 
    if(this.has$Value(tag)) { 
      goog.proto2.Util.assert(goog.isArray(this.values_[tag])); 
    } 
    return this.has$Value(tag) ? this.values_[tag].length: 0; 
  } else { 
    return this.has$Value(tag) ? 1: 0; 
  } 
}; 
goog.proto2.Message.prototype.set$Value = function(tag, value) { 
  if(goog.proto2.Util.conductChecks()) { 
    var field = this.getFieldByTag_(tag); 
    goog.proto2.Util.assert(! field.isRepeated(), 'Cannot call set on a repeated field'); 
    this.checkFieldType_(field, value); 
  } 
  this.values_[tag]= value; 
}; 
goog.proto2.Message.prototype.add$Value = function(tag, value) { 
  if(goog.proto2.Util.conductChecks()) { 
    var field = this.getFieldByTag_(tag); 
    goog.proto2.Util.assert(field.isRepeated(), 'Cannot call add on a non-repeated field'); 
    this.checkFieldType_(field, value); 
  } 
  if(! this.values_[tag]) { 
    this.values_[tag]=[]; 
  } 
  this.values_[tag].push(value); 
}; 
goog.proto2.Message.prototype.checkFieldType_ = function(field, value) { 
  goog.proto2.Util.assert(value !== null); 
  var nativeType = field.getNativeType(); 
  if(nativeType === String) { 
    goog.proto2.Util.assert(typeof value === 'string', 'Expected value of type string'); 
  } else if(nativeType === Boolean) { 
    goog.proto2.Util.assert(typeof value === 'boolean', 'Expected value of type boolean'); 
  } else if(nativeType === Number) { 
    goog.proto2.Util.assert(typeof value === 'number', 'Expected value of type number'); 
  } else if(field.getFieldType() == goog.proto2.FieldDescriptor.FieldType.ENUM) { 
    goog.proto2.Util.assert(typeof value === 'number', 'Expected an enum value, which is a number'); 
  } else { 
    goog.proto2.Util.assert(value instanceof nativeType, 'Expected a matching message type'); 
  } 
}; 
goog.proto2.Message.prototype.clear$Field = function(tag) { 
  goog.proto2.Util.assert(this.getFieldByTag_(tag), 'Unknown field'); 
  delete this.values_[tag]; 
}; 
goog.proto2.Message.set$Metadata = function(messageType, metadataObj) { 
  var fields =[]; 
  var descriptorInfo; 
  for(var key in metadataObj) { 
    if(! metadataObj.hasOwnProperty(key)) { 
      continue; 
    } 
    goog.proto2.Util.assert(goog.string.isNumeric(key), 'Keys must be numeric'); 
    if(key == 0) { 
      descriptorInfo = metadataObj[0]; 
      continue; 
    } 
    fields.push(new goog.proto2.FieldDescriptor(messageType, key, metadataObj[key])); 
  } 
  goog.proto2.Util.assert(descriptorInfo); 
  messageType.descriptor_ = new goog.proto2.Descriptor(messageType, descriptorInfo, fields); 
  messageType.getDescriptor = function() { 
    return messageType.descriptor_; 
  }; 
}; 

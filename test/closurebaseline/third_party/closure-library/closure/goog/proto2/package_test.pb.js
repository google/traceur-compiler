
goog.provide('someprotopackage.TestPackageTypes'); 
goog.require('goog.proto2.Message'); 
goog.require('proto2.TestAllTypes'); 
someprotopackage.TestPackageTypes = function() { 
  goog.proto2.Message.apply(this); 
}; 
goog.inherits(someprotopackage.TestPackageTypes, goog.proto2.Message); 
someprotopackage.TestPackageTypes.prototype.clone; 
someprotopackage.TestPackageTypes.prototype.getOptionalInt32 = function() { 
  return(this.get$Value(1)); 
}; 
someprotopackage.TestPackageTypes.prototype.getOptionalInt32OrDefault = function() { 
  return(this.get$ValueOrDefault(1)); 
}; 
someprotopackage.TestPackageTypes.prototype.setOptionalInt32 = function(value) { 
  this.set$Value(1, value); 
}; 
someprotopackage.TestPackageTypes.prototype.hasOptionalInt32 = function() { 
  return this.has$Value(1); 
}; 
someprotopackage.TestPackageTypes.prototype.optionalInt32Count = function() { 
  return this.count$Values(1); 
}; 
someprotopackage.TestPackageTypes.prototype.clearOptionalInt32 = function() { 
  this.clear$Field(1); 
}; 
someprotopackage.TestPackageTypes.prototype.getOtherAll = function() { 
  return(this.get$Value(2)); 
}; 
someprotopackage.TestPackageTypes.prototype.getOtherAllOrDefault = function() { 
  return(this.get$ValueOrDefault(2)); 
}; 
someprotopackage.TestPackageTypes.prototype.setOtherAll = function(value) { 
  this.set$Value(2, value); 
}; 
someprotopackage.TestPackageTypes.prototype.hasOtherAll = function() { 
  return this.has$Value(2); 
}; 
someprotopackage.TestPackageTypes.prototype.otherAllCount = function() { 
  return this.count$Values(2); 
}; 
someprotopackage.TestPackageTypes.prototype.clearOtherAll = function() { 
  this.clear$Field(2); 
}; 
goog.proto2.Message.set$Metadata(someprotopackage.TestPackageTypes, { 
  0: { 
    name: 'TestPackageTypes', 
    fullName: 'someprotopackage.TestPackageTypes' 
  }, 
  1: { 
    name: 'optional_int32', 
    fieldType: goog.proto2.Message.FieldType.INT32, 
    type: Number 
  }, 
  2: { 
    name: 'other_all', 
    fieldType: goog.proto2.Message.FieldType.MESSAGE, 
    type: proto2.TestAllTypes 
  } 
}); 


goog.provide('proto2.TestAllTypes'); 
goog.provide('proto2.TestAllTypes.NestedMessage'); 
goog.provide('proto2.TestAllTypes.OptionalGroup'); 
goog.provide('proto2.TestAllTypes.RepeatedGroup'); 
goog.provide('proto2.TestAllTypes.NestedEnum'); 
goog.require('goog.proto2.Message'); 
proto2.TestAllTypes = function() { 
  goog.proto2.Message.apply(this); 
}; 
goog.inherits(proto2.TestAllTypes, goog.proto2.Message); 
proto2.TestAllTypes.prototype.clone; 
proto2.TestAllTypes.prototype.getOptionalInt32 = function() { 
  return(this.get$Value(1)); 
}; 
proto2.TestAllTypes.prototype.getOptionalInt32OrDefault = function() { 
  return(this.get$ValueOrDefault(1)); 
}; 
proto2.TestAllTypes.prototype.setOptionalInt32 = function(value) { 
  this.set$Value(1, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalInt32 = function() { 
  return this.has$Value(1); 
}; 
proto2.TestAllTypes.prototype.optionalInt32Count = function() { 
  return this.count$Values(1); 
}; 
proto2.TestAllTypes.prototype.clearOptionalInt32 = function() { 
  this.clear$Field(1); 
}; 
proto2.TestAllTypes.prototype.getOptionalInt64 = function() { 
  return(this.get$Value(2)); 
}; 
proto2.TestAllTypes.prototype.getOptionalInt64OrDefault = function() { 
  return(this.get$ValueOrDefault(2)); 
}; 
proto2.TestAllTypes.prototype.setOptionalInt64 = function(value) { 
  this.set$Value(2, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalInt64 = function() { 
  return this.has$Value(2); 
}; 
proto2.TestAllTypes.prototype.optionalInt64Count = function() { 
  return this.count$Values(2); 
}; 
proto2.TestAllTypes.prototype.clearOptionalInt64 = function() { 
  this.clear$Field(2); 
}; 
proto2.TestAllTypes.prototype.getOptionalUint32 = function() { 
  return(this.get$Value(3)); 
}; 
proto2.TestAllTypes.prototype.getOptionalUint32OrDefault = function() { 
  return(this.get$ValueOrDefault(3)); 
}; 
proto2.TestAllTypes.prototype.setOptionalUint32 = function(value) { 
  this.set$Value(3, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalUint32 = function() { 
  return this.has$Value(3); 
}; 
proto2.TestAllTypes.prototype.optionalUint32Count = function() { 
  return this.count$Values(3); 
}; 
proto2.TestAllTypes.prototype.clearOptionalUint32 = function() { 
  this.clear$Field(3); 
}; 
proto2.TestAllTypes.prototype.getOptionalUint64 = function() { 
  return(this.get$Value(4)); 
}; 
proto2.TestAllTypes.prototype.getOptionalUint64OrDefault = function() { 
  return(this.get$ValueOrDefault(4)); 
}; 
proto2.TestAllTypes.prototype.setOptionalUint64 = function(value) { 
  this.set$Value(4, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalUint64 = function() { 
  return this.has$Value(4); 
}; 
proto2.TestAllTypes.prototype.optionalUint64Count = function() { 
  return this.count$Values(4); 
}; 
proto2.TestAllTypes.prototype.clearOptionalUint64 = function() { 
  this.clear$Field(4); 
}; 
proto2.TestAllTypes.prototype.getOptionalSint32 = function() { 
  return(this.get$Value(5)); 
}; 
proto2.TestAllTypes.prototype.getOptionalSint32OrDefault = function() { 
  return(this.get$ValueOrDefault(5)); 
}; 
proto2.TestAllTypes.prototype.setOptionalSint32 = function(value) { 
  this.set$Value(5, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalSint32 = function() { 
  return this.has$Value(5); 
}; 
proto2.TestAllTypes.prototype.optionalSint32Count = function() { 
  return this.count$Values(5); 
}; 
proto2.TestAllTypes.prototype.clearOptionalSint32 = function() { 
  this.clear$Field(5); 
}; 
proto2.TestAllTypes.prototype.getOptionalSint64 = function() { 
  return(this.get$Value(6)); 
}; 
proto2.TestAllTypes.prototype.getOptionalSint64OrDefault = function() { 
  return(this.get$ValueOrDefault(6)); 
}; 
proto2.TestAllTypes.prototype.setOptionalSint64 = function(value) { 
  this.set$Value(6, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalSint64 = function() { 
  return this.has$Value(6); 
}; 
proto2.TestAllTypes.prototype.optionalSint64Count = function() { 
  return this.count$Values(6); 
}; 
proto2.TestAllTypes.prototype.clearOptionalSint64 = function() { 
  this.clear$Field(6); 
}; 
proto2.TestAllTypes.prototype.getOptionalFixed32 = function() { 
  return(this.get$Value(7)); 
}; 
proto2.TestAllTypes.prototype.getOptionalFixed32OrDefault = function() { 
  return(this.get$ValueOrDefault(7)); 
}; 
proto2.TestAllTypes.prototype.setOptionalFixed32 = function(value) { 
  this.set$Value(7, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalFixed32 = function() { 
  return this.has$Value(7); 
}; 
proto2.TestAllTypes.prototype.optionalFixed32Count = function() { 
  return this.count$Values(7); 
}; 
proto2.TestAllTypes.prototype.clearOptionalFixed32 = function() { 
  this.clear$Field(7); 
}; 
proto2.TestAllTypes.prototype.getOptionalFixed64 = function() { 
  return(this.get$Value(8)); 
}; 
proto2.TestAllTypes.prototype.getOptionalFixed64OrDefault = function() { 
  return(this.get$ValueOrDefault(8)); 
}; 
proto2.TestAllTypes.prototype.setOptionalFixed64 = function(value) { 
  this.set$Value(8, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalFixed64 = function() { 
  return this.has$Value(8); 
}; 
proto2.TestAllTypes.prototype.optionalFixed64Count = function() { 
  return this.count$Values(8); 
}; 
proto2.TestAllTypes.prototype.clearOptionalFixed64 = function() { 
  this.clear$Field(8); 
}; 
proto2.TestAllTypes.prototype.getOptionalSfixed32 = function() { 
  return(this.get$Value(9)); 
}; 
proto2.TestAllTypes.prototype.getOptionalSfixed32OrDefault = function() { 
  return(this.get$ValueOrDefault(9)); 
}; 
proto2.TestAllTypes.prototype.setOptionalSfixed32 = function(value) { 
  this.set$Value(9, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalSfixed32 = function() { 
  return this.has$Value(9); 
}; 
proto2.TestAllTypes.prototype.optionalSfixed32Count = function() { 
  return this.count$Values(9); 
}; 
proto2.TestAllTypes.prototype.clearOptionalSfixed32 = function() { 
  this.clear$Field(9); 
}; 
proto2.TestAllTypes.prototype.getOptionalSfixed64 = function() { 
  return(this.get$Value(10)); 
}; 
proto2.TestAllTypes.prototype.getOptionalSfixed64OrDefault = function() { 
  return(this.get$ValueOrDefault(10)); 
}; 
proto2.TestAllTypes.prototype.setOptionalSfixed64 = function(value) { 
  this.set$Value(10, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalSfixed64 = function() { 
  return this.has$Value(10); 
}; 
proto2.TestAllTypes.prototype.optionalSfixed64Count = function() { 
  return this.count$Values(10); 
}; 
proto2.TestAllTypes.prototype.clearOptionalSfixed64 = function() { 
  this.clear$Field(10); 
}; 
proto2.TestAllTypes.prototype.getOptionalFloat = function() { 
  return(this.get$Value(11)); 
}; 
proto2.TestAllTypes.prototype.getOptionalFloatOrDefault = function() { 
  return(this.get$ValueOrDefault(11)); 
}; 
proto2.TestAllTypes.prototype.setOptionalFloat = function(value) { 
  this.set$Value(11, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalFloat = function() { 
  return this.has$Value(11); 
}; 
proto2.TestAllTypes.prototype.optionalFloatCount = function() { 
  return this.count$Values(11); 
}; 
proto2.TestAllTypes.prototype.clearOptionalFloat = function() { 
  this.clear$Field(11); 
}; 
proto2.TestAllTypes.prototype.getOptionalDouble = function() { 
  return(this.get$Value(12)); 
}; 
proto2.TestAllTypes.prototype.getOptionalDoubleOrDefault = function() { 
  return(this.get$ValueOrDefault(12)); 
}; 
proto2.TestAllTypes.prototype.setOptionalDouble = function(value) { 
  this.set$Value(12, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalDouble = function() { 
  return this.has$Value(12); 
}; 
proto2.TestAllTypes.prototype.optionalDoubleCount = function() { 
  return this.count$Values(12); 
}; 
proto2.TestAllTypes.prototype.clearOptionalDouble = function() { 
  this.clear$Field(12); 
}; 
proto2.TestAllTypes.prototype.getOptionalBool = function() { 
  return(this.get$Value(13)); 
}; 
proto2.TestAllTypes.prototype.getOptionalBoolOrDefault = function() { 
  return(this.get$ValueOrDefault(13)); 
}; 
proto2.TestAllTypes.prototype.setOptionalBool = function(value) { 
  this.set$Value(13, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalBool = function() { 
  return this.has$Value(13); 
}; 
proto2.TestAllTypes.prototype.optionalBoolCount = function() { 
  return this.count$Values(13); 
}; 
proto2.TestAllTypes.prototype.clearOptionalBool = function() { 
  this.clear$Field(13); 
}; 
proto2.TestAllTypes.prototype.getOptionalString = function() { 
  return(this.get$Value(14)); 
}; 
proto2.TestAllTypes.prototype.getOptionalStringOrDefault = function() { 
  return(this.get$ValueOrDefault(14)); 
}; 
proto2.TestAllTypes.prototype.setOptionalString = function(value) { 
  this.set$Value(14, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalString = function() { 
  return this.has$Value(14); 
}; 
proto2.TestAllTypes.prototype.optionalStringCount = function() { 
  return this.count$Values(14); 
}; 
proto2.TestAllTypes.prototype.clearOptionalString = function() { 
  this.clear$Field(14); 
}; 
proto2.TestAllTypes.prototype.getOptionalBytes = function() { 
  return(this.get$Value(15)); 
}; 
proto2.TestAllTypes.prototype.getOptionalBytesOrDefault = function() { 
  return(this.get$ValueOrDefault(15)); 
}; 
proto2.TestAllTypes.prototype.setOptionalBytes = function(value) { 
  this.set$Value(15, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalBytes = function() { 
  return this.has$Value(15); 
}; 
proto2.TestAllTypes.prototype.optionalBytesCount = function() { 
  return this.count$Values(15); 
}; 
proto2.TestAllTypes.prototype.clearOptionalBytes = function() { 
  this.clear$Field(15); 
}; 
proto2.TestAllTypes.prototype.getOptionalgroup = function() { 
  return(this.get$Value(16)); 
}; 
proto2.TestAllTypes.prototype.getOptionalgroupOrDefault = function() { 
  return(this.get$ValueOrDefault(16)); 
}; 
proto2.TestAllTypes.prototype.setOptionalgroup = function(value) { 
  this.set$Value(16, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalgroup = function() { 
  return this.has$Value(16); 
}; 
proto2.TestAllTypes.prototype.optionalgroupCount = function() { 
  return this.count$Values(16); 
}; 
proto2.TestAllTypes.prototype.clearOptionalgroup = function() { 
  this.clear$Field(16); 
}; 
proto2.TestAllTypes.prototype.getOptionalNestedMessage = function() { 
  return(this.get$Value(18)); 
}; 
proto2.TestAllTypes.prototype.getOptionalNestedMessageOrDefault = function() { 
  return(this.get$ValueOrDefault(18)); 
}; 
proto2.TestAllTypes.prototype.setOptionalNestedMessage = function(value) { 
  this.set$Value(18, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalNestedMessage = function() { 
  return this.has$Value(18); 
}; 
proto2.TestAllTypes.prototype.optionalNestedMessageCount = function() { 
  return this.count$Values(18); 
}; 
proto2.TestAllTypes.prototype.clearOptionalNestedMessage = function() { 
  this.clear$Field(18); 
}; 
proto2.TestAllTypes.prototype.getOptionalNestedEnum = function() { 
  return(this.get$Value(21)); 
}; 
proto2.TestAllTypes.prototype.getOptionalNestedEnumOrDefault = function() { 
  return(this.get$ValueOrDefault(21)); 
}; 
proto2.TestAllTypes.prototype.setOptionalNestedEnum = function(value) { 
  this.set$Value(21, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalNestedEnum = function() { 
  return this.has$Value(21); 
}; 
proto2.TestAllTypes.prototype.optionalNestedEnumCount = function() { 
  return this.count$Values(21); 
}; 
proto2.TestAllTypes.prototype.clearOptionalNestedEnum = function() { 
  this.clear$Field(21); 
}; 
proto2.TestAllTypes.prototype.getOptionalInt64Number = function() { 
  return(this.get$Value(50)); 
}; 
proto2.TestAllTypes.prototype.getOptionalInt64NumberOrDefault = function() { 
  return(this.get$ValueOrDefault(50)); 
}; 
proto2.TestAllTypes.prototype.setOptionalInt64Number = function(value) { 
  this.set$Value(50, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalInt64Number = function() { 
  return this.has$Value(50); 
}; 
proto2.TestAllTypes.prototype.optionalInt64NumberCount = function() { 
  return this.count$Values(50); 
}; 
proto2.TestAllTypes.prototype.clearOptionalInt64Number = function() { 
  this.clear$Field(50); 
}; 
proto2.TestAllTypes.prototype.getOptionalInt64String = function() { 
  return(this.get$Value(51)); 
}; 
proto2.TestAllTypes.prototype.getOptionalInt64StringOrDefault = function() { 
  return(this.get$ValueOrDefault(51)); 
}; 
proto2.TestAllTypes.prototype.setOptionalInt64String = function(value) { 
  this.set$Value(51, value); 
}; 
proto2.TestAllTypes.prototype.hasOptionalInt64String = function() { 
  return this.has$Value(51); 
}; 
proto2.TestAllTypes.prototype.optionalInt64StringCount = function() { 
  return this.count$Values(51); 
}; 
proto2.TestAllTypes.prototype.clearOptionalInt64String = function() { 
  this.clear$Field(51); 
}; 
proto2.TestAllTypes.prototype.getRepeatedInt32 = function(index) { 
  return(this.get$Value(31, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedInt32OrDefault = function(index) { 
  return(this.get$ValueOrDefault(31, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedInt32 = function(value) { 
  this.add$Value(31, value); 
}; 
proto2.TestAllTypes.prototype.repeatedInt32Array = function() { 
  return(this.array$Values(31)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedInt32 = function() { 
  return this.has$Value(31); 
}; 
proto2.TestAllTypes.prototype.repeatedInt32Count = function() { 
  return this.count$Values(31); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedInt32 = function() { 
  this.clear$Field(31); 
}; 
proto2.TestAllTypes.prototype.getRepeatedInt64 = function(index) { 
  return(this.get$Value(32, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedInt64OrDefault = function(index) { 
  return(this.get$ValueOrDefault(32, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedInt64 = function(value) { 
  this.add$Value(32, value); 
}; 
proto2.TestAllTypes.prototype.repeatedInt64Array = function() { 
  return(this.array$Values(32)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedInt64 = function() { 
  return this.has$Value(32); 
}; 
proto2.TestAllTypes.prototype.repeatedInt64Count = function() { 
  return this.count$Values(32); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedInt64 = function() { 
  this.clear$Field(32); 
}; 
proto2.TestAllTypes.prototype.getRepeatedUint32 = function(index) { 
  return(this.get$Value(33, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedUint32OrDefault = function(index) { 
  return(this.get$ValueOrDefault(33, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedUint32 = function(value) { 
  this.add$Value(33, value); 
}; 
proto2.TestAllTypes.prototype.repeatedUint32Array = function() { 
  return(this.array$Values(33)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedUint32 = function() { 
  return this.has$Value(33); 
}; 
proto2.TestAllTypes.prototype.repeatedUint32Count = function() { 
  return this.count$Values(33); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedUint32 = function() { 
  this.clear$Field(33); 
}; 
proto2.TestAllTypes.prototype.getRepeatedUint64 = function(index) { 
  return(this.get$Value(34, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedUint64OrDefault = function(index) { 
  return(this.get$ValueOrDefault(34, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedUint64 = function(value) { 
  this.add$Value(34, value); 
}; 
proto2.TestAllTypes.prototype.repeatedUint64Array = function() { 
  return(this.array$Values(34)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedUint64 = function() { 
  return this.has$Value(34); 
}; 
proto2.TestAllTypes.prototype.repeatedUint64Count = function() { 
  return this.count$Values(34); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedUint64 = function() { 
  this.clear$Field(34); 
}; 
proto2.TestAllTypes.prototype.getRepeatedSint32 = function(index) { 
  return(this.get$Value(35, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedSint32OrDefault = function(index) { 
  return(this.get$ValueOrDefault(35, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedSint32 = function(value) { 
  this.add$Value(35, value); 
}; 
proto2.TestAllTypes.prototype.repeatedSint32Array = function() { 
  return(this.array$Values(35)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedSint32 = function() { 
  return this.has$Value(35); 
}; 
proto2.TestAllTypes.prototype.repeatedSint32Count = function() { 
  return this.count$Values(35); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedSint32 = function() { 
  this.clear$Field(35); 
}; 
proto2.TestAllTypes.prototype.getRepeatedSint64 = function(index) { 
  return(this.get$Value(36, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedSint64OrDefault = function(index) { 
  return(this.get$ValueOrDefault(36, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedSint64 = function(value) { 
  this.add$Value(36, value); 
}; 
proto2.TestAllTypes.prototype.repeatedSint64Array = function() { 
  return(this.array$Values(36)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedSint64 = function() { 
  return this.has$Value(36); 
}; 
proto2.TestAllTypes.prototype.repeatedSint64Count = function() { 
  return this.count$Values(36); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedSint64 = function() { 
  this.clear$Field(36); 
}; 
proto2.TestAllTypes.prototype.getRepeatedFixed32 = function(index) { 
  return(this.get$Value(37, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedFixed32OrDefault = function(index) { 
  return(this.get$ValueOrDefault(37, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedFixed32 = function(value) { 
  this.add$Value(37, value); 
}; 
proto2.TestAllTypes.prototype.repeatedFixed32Array = function() { 
  return(this.array$Values(37)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedFixed32 = function() { 
  return this.has$Value(37); 
}; 
proto2.TestAllTypes.prototype.repeatedFixed32Count = function() { 
  return this.count$Values(37); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedFixed32 = function() { 
  this.clear$Field(37); 
}; 
proto2.TestAllTypes.prototype.getRepeatedFixed64 = function(index) { 
  return(this.get$Value(38, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedFixed64OrDefault = function(index) { 
  return(this.get$ValueOrDefault(38, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedFixed64 = function(value) { 
  this.add$Value(38, value); 
}; 
proto2.TestAllTypes.prototype.repeatedFixed64Array = function() { 
  return(this.array$Values(38)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedFixed64 = function() { 
  return this.has$Value(38); 
}; 
proto2.TestAllTypes.prototype.repeatedFixed64Count = function() { 
  return this.count$Values(38); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedFixed64 = function() { 
  this.clear$Field(38); 
}; 
proto2.TestAllTypes.prototype.getRepeatedSfixed32 = function(index) { 
  return(this.get$Value(39, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedSfixed32OrDefault = function(index) { 
  return(this.get$ValueOrDefault(39, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedSfixed32 = function(value) { 
  this.add$Value(39, value); 
}; 
proto2.TestAllTypes.prototype.repeatedSfixed32Array = function() { 
  return(this.array$Values(39)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedSfixed32 = function() { 
  return this.has$Value(39); 
}; 
proto2.TestAllTypes.prototype.repeatedSfixed32Count = function() { 
  return this.count$Values(39); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedSfixed32 = function() { 
  this.clear$Field(39); 
}; 
proto2.TestAllTypes.prototype.getRepeatedSfixed64 = function(index) { 
  return(this.get$Value(40, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedSfixed64OrDefault = function(index) { 
  return(this.get$ValueOrDefault(40, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedSfixed64 = function(value) { 
  this.add$Value(40, value); 
}; 
proto2.TestAllTypes.prototype.repeatedSfixed64Array = function() { 
  return(this.array$Values(40)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedSfixed64 = function() { 
  return this.has$Value(40); 
}; 
proto2.TestAllTypes.prototype.repeatedSfixed64Count = function() { 
  return this.count$Values(40); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedSfixed64 = function() { 
  this.clear$Field(40); 
}; 
proto2.TestAllTypes.prototype.getRepeatedFloat = function(index) { 
  return(this.get$Value(41, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedFloatOrDefault = function(index) { 
  return(this.get$ValueOrDefault(41, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedFloat = function(value) { 
  this.add$Value(41, value); 
}; 
proto2.TestAllTypes.prototype.repeatedFloatArray = function() { 
  return(this.array$Values(41)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedFloat = function() { 
  return this.has$Value(41); 
}; 
proto2.TestAllTypes.prototype.repeatedFloatCount = function() { 
  return this.count$Values(41); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedFloat = function() { 
  this.clear$Field(41); 
}; 
proto2.TestAllTypes.prototype.getRepeatedDouble = function(index) { 
  return(this.get$Value(42, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedDoubleOrDefault = function(index) { 
  return(this.get$ValueOrDefault(42, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedDouble = function(value) { 
  this.add$Value(42, value); 
}; 
proto2.TestAllTypes.prototype.repeatedDoubleArray = function() { 
  return(this.array$Values(42)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedDouble = function() { 
  return this.has$Value(42); 
}; 
proto2.TestAllTypes.prototype.repeatedDoubleCount = function() { 
  return this.count$Values(42); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedDouble = function() { 
  this.clear$Field(42); 
}; 
proto2.TestAllTypes.prototype.getRepeatedBool = function(index) { 
  return(this.get$Value(43, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedBoolOrDefault = function(index) { 
  return(this.get$ValueOrDefault(43, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedBool = function(value) { 
  this.add$Value(43, value); 
}; 
proto2.TestAllTypes.prototype.repeatedBoolArray = function() { 
  return(this.array$Values(43)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedBool = function() { 
  return this.has$Value(43); 
}; 
proto2.TestAllTypes.prototype.repeatedBoolCount = function() { 
  return this.count$Values(43); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedBool = function() { 
  this.clear$Field(43); 
}; 
proto2.TestAllTypes.prototype.getRepeatedString = function(index) { 
  return(this.get$Value(44, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedStringOrDefault = function(index) { 
  return(this.get$ValueOrDefault(44, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedString = function(value) { 
  this.add$Value(44, value); 
}; 
proto2.TestAllTypes.prototype.repeatedStringArray = function() { 
  return(this.array$Values(44)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedString = function() { 
  return this.has$Value(44); 
}; 
proto2.TestAllTypes.prototype.repeatedStringCount = function() { 
  return this.count$Values(44); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedString = function() { 
  this.clear$Field(44); 
}; 
proto2.TestAllTypes.prototype.getRepeatedBytes = function(index) { 
  return(this.get$Value(45, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedBytesOrDefault = function(index) { 
  return(this.get$ValueOrDefault(45, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedBytes = function(value) { 
  this.add$Value(45, value); 
}; 
proto2.TestAllTypes.prototype.repeatedBytesArray = function() { 
  return(this.array$Values(45)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedBytes = function() { 
  return this.has$Value(45); 
}; 
proto2.TestAllTypes.prototype.repeatedBytesCount = function() { 
  return this.count$Values(45); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedBytes = function() { 
  this.clear$Field(45); 
}; 
proto2.TestAllTypes.prototype.getRepeatedgroup = function(index) { 
  return(this.get$Value(46, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedgroupOrDefault = function(index) { 
  return(this.get$ValueOrDefault(46, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedgroup = function(value) { 
  this.add$Value(46, value); 
}; 
proto2.TestAllTypes.prototype.repeatedgroupArray = function() { 
  return(this.array$Values(46)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedgroup = function() { 
  return this.has$Value(46); 
}; 
proto2.TestAllTypes.prototype.repeatedgroupCount = function() { 
  return this.count$Values(46); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedgroup = function() { 
  this.clear$Field(46); 
}; 
proto2.TestAllTypes.prototype.getRepeatedNestedMessage = function(index) { 
  return(this.get$Value(48, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedNestedMessageOrDefault = function(index) { 
  return(this.get$ValueOrDefault(48, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedNestedMessage = function(value) { 
  this.add$Value(48, value); 
}; 
proto2.TestAllTypes.prototype.repeatedNestedMessageArray = function() { 
  return(this.array$Values(48)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedNestedMessage = function() { 
  return this.has$Value(48); 
}; 
proto2.TestAllTypes.prototype.repeatedNestedMessageCount = function() { 
  return this.count$Values(48); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedNestedMessage = function() { 
  this.clear$Field(48); 
}; 
proto2.TestAllTypes.prototype.getRepeatedNestedEnum = function(index) { 
  return(this.get$Value(49, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedNestedEnumOrDefault = function(index) { 
  return(this.get$ValueOrDefault(49, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedNestedEnum = function(value) { 
  this.add$Value(49, value); 
}; 
proto2.TestAllTypes.prototype.repeatedNestedEnumArray = function() { 
  return(this.array$Values(49)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedNestedEnum = function() { 
  return this.has$Value(49); 
}; 
proto2.TestAllTypes.prototype.repeatedNestedEnumCount = function() { 
  return this.count$Values(49); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedNestedEnum = function() { 
  this.clear$Field(49); 
}; 
proto2.TestAllTypes.prototype.getRepeatedInt64Number = function(index) { 
  return(this.get$Value(52, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedInt64NumberOrDefault = function(index) { 
  return(this.get$ValueOrDefault(52, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedInt64Number = function(value) { 
  this.add$Value(52, value); 
}; 
proto2.TestAllTypes.prototype.repeatedInt64NumberArray = function() { 
  return(this.array$Values(52)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedInt64Number = function() { 
  return this.has$Value(52); 
}; 
proto2.TestAllTypes.prototype.repeatedInt64NumberCount = function() { 
  return this.count$Values(52); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedInt64Number = function() { 
  this.clear$Field(52); 
}; 
proto2.TestAllTypes.prototype.getRepeatedInt64String = function(index) { 
  return(this.get$Value(53, index)); 
}; 
proto2.TestAllTypes.prototype.getRepeatedInt64StringOrDefault = function(index) { 
  return(this.get$ValueOrDefault(53, index)); 
}; 
proto2.TestAllTypes.prototype.addRepeatedInt64String = function(value) { 
  this.add$Value(53, value); 
}; 
proto2.TestAllTypes.prototype.repeatedInt64StringArray = function() { 
  return(this.array$Values(53)); 
}; 
proto2.TestAllTypes.prototype.hasRepeatedInt64String = function() { 
  return this.has$Value(53); 
}; 
proto2.TestAllTypes.prototype.repeatedInt64StringCount = function() { 
  return this.count$Values(53); 
}; 
proto2.TestAllTypes.prototype.clearRepeatedInt64String = function() { 
  this.clear$Field(53); 
}; 
proto2.TestAllTypes.NestedEnum = { 
  FOO: 1, 
  BAR: 2, 
  BAZ: 3 
}; 
proto2.TestAllTypes.NestedMessage = function() { 
  goog.proto2.Message.apply(this); 
}; 
goog.inherits(proto2.TestAllTypes.NestedMessage, goog.proto2.Message); 
proto2.TestAllTypes.NestedMessage.prototype.clone; 
proto2.TestAllTypes.NestedMessage.prototype.getB = function() { 
  return(this.get$Value(1)); 
}; 
proto2.TestAllTypes.NestedMessage.prototype.getBOrDefault = function() { 
  return(this.get$ValueOrDefault(1)); 
}; 
proto2.TestAllTypes.NestedMessage.prototype.setB = function(value) { 
  this.set$Value(1, value); 
}; 
proto2.TestAllTypes.NestedMessage.prototype.hasB = function() { 
  return this.has$Value(1); 
}; 
proto2.TestAllTypes.NestedMessage.prototype.bCount = function() { 
  return this.count$Values(1); 
}; 
proto2.TestAllTypes.NestedMessage.prototype.clearB = function() { 
  this.clear$Field(1); 
}; 
proto2.TestAllTypes.OptionalGroup = function() { 
  goog.proto2.Message.apply(this); 
}; 
goog.inherits(proto2.TestAllTypes.OptionalGroup, goog.proto2.Message); 
proto2.TestAllTypes.OptionalGroup.prototype.clone; 
proto2.TestAllTypes.OptionalGroup.prototype.getA = function() { 
  return(this.get$Value(17)); 
}; 
proto2.TestAllTypes.OptionalGroup.prototype.getAOrDefault = function() { 
  return(this.get$ValueOrDefault(17)); 
}; 
proto2.TestAllTypes.OptionalGroup.prototype.setA = function(value) { 
  this.set$Value(17, value); 
}; 
proto2.TestAllTypes.OptionalGroup.prototype.hasA = function() { 
  return this.has$Value(17); 
}; 
proto2.TestAllTypes.OptionalGroup.prototype.aCount = function() { 
  return this.count$Values(17); 
}; 
proto2.TestAllTypes.OptionalGroup.prototype.clearA = function() { 
  this.clear$Field(17); 
}; 
proto2.TestAllTypes.RepeatedGroup = function() { 
  goog.proto2.Message.apply(this); 
}; 
goog.inherits(proto2.TestAllTypes.RepeatedGroup, goog.proto2.Message); 
proto2.TestAllTypes.RepeatedGroup.prototype.clone; 
proto2.TestAllTypes.RepeatedGroup.prototype.getA = function(index) { 
  return(this.get$Value(47, index)); 
}; 
proto2.TestAllTypes.RepeatedGroup.prototype.getAOrDefault = function(index) { 
  return(this.get$ValueOrDefault(47, index)); 
}; 
proto2.TestAllTypes.RepeatedGroup.prototype.addA = function(value) { 
  this.add$Value(47, value); 
}; 
proto2.TestAllTypes.RepeatedGroup.prototype.aArray = function() { 
  return(this.array$Values(47)); 
}; 
proto2.TestAllTypes.RepeatedGroup.prototype.hasA = function() { 
  return this.has$Value(47); 
}; 
proto2.TestAllTypes.RepeatedGroup.prototype.aCount = function() { 
  return this.count$Values(47); 
}; 
proto2.TestAllTypes.RepeatedGroup.prototype.clearA = function() { 
  this.clear$Field(47); 
}; 
goog.proto2.Message.set$Metadata(proto2.TestAllTypes, { 
  0: { 
    name: 'TestAllTypes', 
    fullName: 'TestAllTypes' 
  }, 
  1: { 
    name: 'optional_int32', 
    fieldType: goog.proto2.Message.FieldType.INT32, 
    type: Number 
  }, 
  2: { 
    name: 'optional_int64', 
    fieldType: goog.proto2.Message.FieldType.INT64, 
    defaultValue: '1', 
    type: String 
  }, 
  3: { 
    name: 'optional_uint32', 
    fieldType: goog.proto2.Message.FieldType.UINT32, 
    type: Number 
  }, 
  4: { 
    name: 'optional_uint64', 
    fieldType: goog.proto2.Message.FieldType.UINT64, 
    type: String 
  }, 
  5: { 
    name: 'optional_sint32', 
    fieldType: goog.proto2.Message.FieldType.SINT32, 
    type: Number 
  }, 
  6: { 
    name: 'optional_sint64', 
    fieldType: goog.proto2.Message.FieldType.SINT64, 
    type: String 
  }, 
  7: { 
    name: 'optional_fixed32', 
    fieldType: goog.proto2.Message.FieldType.FIXED32, 
    type: Number 
  }, 
  8: { 
    name: 'optional_fixed64', 
    fieldType: goog.proto2.Message.FieldType.FIXED64, 
    type: String 
  }, 
  9: { 
    name: 'optional_sfixed32', 
    fieldType: goog.proto2.Message.FieldType.SFIXED32, 
    type: Number 
  }, 
  10: { 
    name: 'optional_sfixed64', 
    fieldType: goog.proto2.Message.FieldType.SFIXED64, 
    type: String 
  }, 
  11: { 
    name: 'optional_float', 
    fieldType: goog.proto2.Message.FieldType.FLOAT, 
    defaultValue: 1.5, 
    type: Number 
  }, 
  12: { 
    name: 'optional_double', 
    fieldType: goog.proto2.Message.FieldType.DOUBLE, 
    type: Number 
  }, 
  13: { 
    name: 'optional_bool', 
    fieldType: goog.proto2.Message.FieldType.BOOL, 
    type: Boolean 
  }, 
  14: { 
    name: 'optional_string', 
    fieldType: goog.proto2.Message.FieldType.STRING, 
    type: String 
  }, 
  15: { 
    name: 'optional_bytes', 
    fieldType: goog.proto2.Message.FieldType.BYTES, 
    defaultValue: 'moo', 
    type: String 
  }, 
  16: { 
    name: 'optionalgroup', 
    fieldType: goog.proto2.Message.FieldType.GROUP, 
    type: proto2.TestAllTypes.OptionalGroup 
  }, 
  18: { 
    name: 'optional_nested_message', 
    fieldType: goog.proto2.Message.FieldType.MESSAGE, 
    type: proto2.TestAllTypes.NestedMessage 
  }, 
  21: { 
    name: 'optional_nested_enum', 
    fieldType: goog.proto2.Message.FieldType.ENUM, 
    defaultValue: proto2.TestAllTypes.NestedEnum.FOO, 
    type: proto2.TestAllTypes.NestedEnum 
  }, 
  50: { 
    name: 'optional_int64_number', 
    fieldType: goog.proto2.Message.FieldType.INT64, 
    defaultValue: 1000000000000000001, 
    type: Number 
  }, 
  51: { 
    name: 'optional_int64_string', 
    fieldType: goog.proto2.Message.FieldType.INT64, 
    defaultValue: '1000000000000000001', 
    type: String 
  }, 
  31: { 
    name: 'repeated_int32', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.INT32, 
    type: Number 
  }, 
  32: { 
    name: 'repeated_int64', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.INT64, 
    type: String 
  }, 
  33: { 
    name: 'repeated_uint32', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.UINT32, 
    type: Number 
  }, 
  34: { 
    name: 'repeated_uint64', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.UINT64, 
    type: String 
  }, 
  35: { 
    name: 'repeated_sint32', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.SINT32, 
    type: Number 
  }, 
  36: { 
    name: 'repeated_sint64', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.SINT64, 
    type: String 
  }, 
  37: { 
    name: 'repeated_fixed32', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.FIXED32, 
    type: Number 
  }, 
  38: { 
    name: 'repeated_fixed64', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.FIXED64, 
    type: String 
  }, 
  39: { 
    name: 'repeated_sfixed32', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.SFIXED32, 
    type: Number 
  }, 
  40: { 
    name: 'repeated_sfixed64', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.SFIXED64, 
    type: String 
  }, 
  41: { 
    name: 'repeated_float', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.FLOAT, 
    type: Number 
  }, 
  42: { 
    name: 'repeated_double', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.DOUBLE, 
    type: Number 
  }, 
  43: { 
    name: 'repeated_bool', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.BOOL, 
    type: Boolean 
  }, 
  44: { 
    name: 'repeated_string', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.STRING, 
    type: String 
  }, 
  45: { 
    name: 'repeated_bytes', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.BYTES, 
    type: String 
  }, 
  46: { 
    name: 'repeatedgroup', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.GROUP, 
    type: proto2.TestAllTypes.RepeatedGroup 
  }, 
  48: { 
    name: 'repeated_nested_message', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.MESSAGE, 
    type: proto2.TestAllTypes.NestedMessage 
  }, 
  49: { 
    name: 'repeated_nested_enum', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.ENUM, 
    defaultValue: proto2.TestAllTypes.NestedEnum.FOO, 
    type: proto2.TestAllTypes.NestedEnum 
  }, 
  52: { 
    name: 'repeated_int64_number', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.INT64, 
    type: Number 
  }, 
  53: { 
    name: 'repeated_int64_string', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.INT64, 
    type: String 
  } 
}); 
goog.proto2.Message.set$Metadata(proto2.TestAllTypes.NestedMessage, { 
  0: { 
    name: 'NestedMessage', 
    containingType: proto2.TestAllTypes, 
    fullName: 'TestAllTypes.NestedMessage' 
  }, 
  1: { 
    name: 'b', 
    fieldType: goog.proto2.Message.FieldType.INT32, 
    type: Number 
  } 
}); 
goog.proto2.Message.set$Metadata(proto2.TestAllTypes.OptionalGroup, { 
  0: { 
    name: 'OptionalGroup', 
    containingType: proto2.TestAllTypes, 
    fullName: 'TestAllTypes.OptionalGroup' 
  }, 
  17: { 
    name: 'a', 
    fieldType: goog.proto2.Message.FieldType.INT32, 
    type: Number 
  } 
}); 
goog.proto2.Message.set$Metadata(proto2.TestAllTypes.RepeatedGroup, { 
  0: { 
    name: 'RepeatedGroup', 
    containingType: proto2.TestAllTypes, 
    fullName: 'TestAllTypes.RepeatedGroup' 
  }, 
  47: { 
    name: 'a', 
    repeated: true, 
    fieldType: goog.proto2.Message.FieldType.INT32, 
    type: Number 
  } 
}); 

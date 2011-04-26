
goog.provide('goog.proto'); 
goog.require('goog.proto.Serializer'); 
goog.proto.serializer_ = null; 
goog.proto.serialize = function(object) { 
  if(! goog.proto.serializer_) { 
    goog.proto.serializer_ = new goog.proto.Serializer; 
  } 
  return goog.proto.serializer_.serialize(object); 
}; 

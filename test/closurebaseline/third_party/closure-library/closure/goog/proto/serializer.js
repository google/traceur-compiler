
goog.provide('goog.proto.Serializer'); 
goog.require('goog.json.Serializer'); 
goog.require('goog.string'); 
goog.proto.Serializer = function() { 
  goog.json.Serializer.call(this); 
}; 
goog.inherits(goog.proto.Serializer, goog.json.Serializer); 
goog.proto.Serializer.prototype.serializeArray_ = function(arr, sb) { 
  var l = arr.length; 
  sb.push('['); 
  var emptySlots = 0; 
  var sep = ''; 
  for(var i = 0; i < l; i ++) { 
    if(arr[i]== null) { 
      emptySlots ++; 
    } else { 
      if(emptySlots > 0) { 
        sb.push(goog.string.repeat(',', emptySlots)); 
        emptySlots = 0; 
      } 
      sb.push(sep); 
      this.serialize_(arr[i], sb); 
      sep = ','; 
    } 
  } 
  sb.push(']'); 
}; 

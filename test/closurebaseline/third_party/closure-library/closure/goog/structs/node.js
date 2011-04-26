
goog.provide('goog.structs.Node'); 
goog.structs.Node = function(key, value) { 
  this.key_ = key; 
  this.value_ = value; 
}; 
goog.structs.Node.prototype.getKey = function() { 
  return this.key_; 
}; 
goog.structs.Node.prototype.getValue = function() { 
  return this.value_; 
}; 
goog.structs.Node.prototype.clone = function() { 
  return new goog.structs.Node(this.key_, this.value_); 
}; 

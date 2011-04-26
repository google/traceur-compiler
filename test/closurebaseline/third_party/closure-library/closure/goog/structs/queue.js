
goog.provide('goog.structs.Queue'); 
goog.require('goog.array'); 
goog.structs.Queue = function() { 
  this.elements_ =[]; 
}; 
goog.structs.Queue.prototype.head_ = 0; 
goog.structs.Queue.prototype.tail_ = 0; 
goog.structs.Queue.prototype.enqueue = function(element) { 
  this.elements_[this.tail_ ++]= element; 
}; 
goog.structs.Queue.prototype.dequeue = function() { 
  if(this.head_ == this.tail_) { 
    return undefined; 
  } 
  var result = this.elements_[this.head_]; 
  delete this.elements_[this.head_]; 
  this.head_ ++; 
  return result; 
}; 
goog.structs.Queue.prototype.peek = function() { 
  if(this.head_ == this.tail_) { 
    return undefined; 
  } 
  return this.elements_[this.head_]; 
}; 
goog.structs.Queue.prototype.getCount = function() { 
  return this.tail_ - this.head_; 
}; 
goog.structs.Queue.prototype.isEmpty = function() { 
  return this.tail_ - this.head_ == 0; 
}; 
goog.structs.Queue.prototype.clear = function() { 
  this.elements_.length = 0; 
  this.head_ = 0; 
  this.tail_ = 0; 
}; 
goog.structs.Queue.prototype.contains = function(obj) { 
  return goog.array.contains(this.elements_, obj); 
}; 
goog.structs.Queue.prototype.remove = function(obj) { 
  var index = goog.array.indexOf(this.elements_, obj); 
  if(index < 0) { 
    return false; 
  } 
  if(index == this.head_) { 
    this.dequeue(); 
  } else { 
    goog.array.removeAt(this.elements_, index); 
    this.tail_ --; 
  } 
  return true; 
}; 
goog.structs.Queue.prototype.getValues = function() { 
  return this.elements_.slice(this.head_, this.tail_); 
}; 

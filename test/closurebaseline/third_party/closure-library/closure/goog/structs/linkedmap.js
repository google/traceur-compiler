
goog.provide('goog.structs.LinkedMap'); 
goog.require('goog.structs.Map'); 
goog.structs.LinkedMap = function(opt_maxCount, opt_cache) { 
  this.maxCount_ = opt_maxCount || null; 
  this.cache_ = ! ! opt_cache; 
  this.map_ = new goog.structs.Map(); 
  this.head_ = new goog.structs.LinkedMap.Node_('', undefined); 
  this.head_.next = this.head_.prev = this.head_; 
}; 
goog.structs.LinkedMap.prototype.findAndMoveToTop_ = function(key) { 
  var node =(this.map_.get(key)); 
  if(node) { 
    if(this.cache_) { 
      node.remove(); 
      this.insert_(node); 
    } 
  } 
  return node; 
}; 
goog.structs.LinkedMap.prototype.get = function(key, opt_val) { 
  var node = this.findAndMoveToTop_(key); 
  return node ? node.value: opt_val; 
}; 
goog.structs.LinkedMap.prototype.peekValue = function(key, opt_val) { 
  var node = this.map_.get(key); 
  return node ? node.value: opt_val; 
}; 
goog.structs.LinkedMap.prototype.set = function(key, value) { 
  var node = this.findAndMoveToTop_(key); 
  if(node) { 
    node.value = value; 
  } else { 
    node = new goog.structs.LinkedMap.Node_(key, value); 
    this.map_.set(key, node); 
    this.insert_(node); 
  } 
}; 
goog.structs.LinkedMap.prototype.peek = function() { 
  return this.head_.next.value; 
}; 
goog.structs.LinkedMap.prototype.peekLast = function() { 
  return this.head_.prev.value; 
}; 
goog.structs.LinkedMap.prototype.shift = function() { 
  return this.popNode_(this.head_.next); 
}; 
goog.structs.LinkedMap.prototype.pop = function() { 
  return this.popNode_(this.head_.prev); 
}; 
goog.structs.LinkedMap.prototype.remove = function(key) { 
  var node =(this.map_.get(key)); 
  if(node) { 
    this.removeNode(node); 
    return true; 
  } 
  return false; 
}; 
goog.structs.LinkedMap.prototype.removeNode = function(node) { 
  node.remove(); 
  this.map_.remove(node.key); 
}; 
goog.structs.LinkedMap.prototype.getCount = function() { 
  return this.map_.getCount(); 
}; 
goog.structs.LinkedMap.prototype.isEmpty = function() { 
  return this.map_.isEmpty(); 
}; 
goog.structs.LinkedMap.prototype.setMaxCount = function(maxCount) { 
  this.maxCount_ = maxCount || null; 
  if(this.maxCount_ != null) { 
    this.truncate_(this.maxCount_); 
  } 
}; 
goog.structs.LinkedMap.prototype.getKeys = function() { 
  return this.map(function(val, key) { 
    return key; 
  }); 
}; 
goog.structs.LinkedMap.prototype.getValues = function() { 
  return this.map(function(val, key) { 
    return val; 
  }); 
}; 
goog.structs.LinkedMap.prototype.contains = function(value) { 
  return this.some(function(el) { 
    return el == value; 
  }); 
}; 
goog.structs.LinkedMap.prototype.containsKey = function(key) { 
  return this.map_.containsKey(key); 
}; 
goog.structs.LinkedMap.prototype.clear = function() { 
  this.truncate_(0); 
}; 
goog.structs.LinkedMap.prototype.forEach = function(f, opt_obj) { 
  for(var n = this.head_.next; n != this.head_; n = n.next) { 
    f.call(opt_obj, n.value, n.key, this); 
  } 
}; 
goog.structs.LinkedMap.prototype.map = function(f, opt_obj) { 
  var rv =[]; 
  for(var n = this.head_.next; n != this.head_; n = n.next) { 
    rv.push(f.call(opt_obj, n.value, n.key, this)); 
  } 
  return rv; 
}; 
goog.structs.LinkedMap.prototype.some = function(f, opt_obj) { 
  for(var n = this.head_.next; n != this.head_; n = n.next) { 
    if(f.call(opt_obj, n.value, n.key, this)) { 
      return true; 
    } 
  } 
  return false; 
}; 
goog.structs.LinkedMap.prototype.every = function(f, opt_obj) { 
  for(var n = this.head_.next; n != this.head_; n = n.next) { 
    if(! f.call(opt_obj, n.value, n.key, this)) { 
      return false; 
    } 
  } 
  return true; 
}; 
goog.structs.LinkedMap.prototype.insert_ = function(node) { 
  if(this.cache_) { 
    node.next = this.head_.next; 
    node.prev = this.head_; 
    this.head_.next = node; 
    node.next.prev = node; 
  } else { 
    node.prev = this.head_.prev; 
    node.next = this.head_; 
    this.head_.prev = node; 
    node.prev.next = node; 
  } 
  if(this.maxCount_ != null) { 
    this.truncate_(this.maxCount_); 
  } 
}; 
goog.structs.LinkedMap.prototype.truncate_ = function(count) { 
  for(var i = this.map_.getCount(); i > count; i --) { 
    this.removeNode(this.cache_ ? this.head_.prev: this.head_.next); 
  } 
}; 
goog.structs.LinkedMap.prototype.popNode_ = function(node) { 
  if(this.head_ != node) { 
    this.removeNode(node); 
  } 
  return node.value; 
}; 
goog.structs.LinkedMap.Node_ = function(key, value) { 
  this.key = key; 
  this.value = value; 
}; 
goog.structs.LinkedMap.Node_.prototype.next; 
goog.structs.LinkedMap.Node_.prototype.prev; 
goog.structs.LinkedMap.Node_.prototype.remove = function() { 
  this.prev.next = this.next; 
  this.next.prev = this.prev; 
  delete this.prev; 
  delete this.next; 
}; 

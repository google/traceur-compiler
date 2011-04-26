
goog.provide('goog.structs.StringSet'); 
goog.require('goog.iter'); 
goog.structs.StringSet = function(opt_elements) { 
  this.elements_ = { }; 
  if(opt_elements) { 
    for(var i = 0; i < opt_elements.length; i ++) { 
      this.elements_[this.encode(opt_elements[i])]= null; 
    } 
  } 
}; 
goog.structs.StringSet.EMPTY_OBJECT_ = { }; 
goog.structs.StringSet.prototype.encode = function(element) { 
  return element in goog.structs.StringSet.EMPTY_OBJECT_ || String(element).charCodeAt(0) == 32 ? ' ' + element: element; 
}; 
goog.structs.StringSet.prototype.decode = function(key) { 
  return key.charCodeAt(0) == 32 ? key.substr(1): key; 
}; 
goog.structs.StringSet.prototype.add = function(element) { 
  this.elements_[this.encode(element)]= null; 
}; 
goog.structs.StringSet.prototype.addArray = function(arr) { 
  for(var i = 0; i < arr.length; i ++) { 
    this.elements_[this.encode(arr[i])]= null; 
  } 
}; 
goog.structs.StringSet.prototype.addDifference_ = function(set1, set2) { 
  for(var key in set1.elements_) { 
    if(set1.elements_.hasOwnProperty(key) && ! set2.elements_.hasOwnProperty(key)) { 
      this.elements_[key]= null; 
    } 
  } 
}; 
goog.structs.StringSet.prototype.addSet = function(stringSet) { 
  for(var key in stringSet.elements_) { 
    if(stringSet.elements_.hasOwnProperty(key)) { 
      this.elements_[key]= null; 
    } 
  } 
}; 
goog.structs.StringSet.prototype.clear = function() { 
  this.elements_ = { }; 
}; 
goog.structs.StringSet.prototype.clone = function() { 
  var ret = new goog.structs.StringSet; 
  ret.addSet(this); 
  return ret; 
}; 
goog.structs.StringSet.prototype.contains = function(element) { 
  return this.elements_.hasOwnProperty(this.encode(element)); 
}; 
goog.structs.StringSet.prototype.containsArray = function(arr) { 
  for(var i = 0; i < arr.length; i ++) { 
    if(! this.elements_.hasOwnProperty(this.encode(arr[i]))) { 
      return false; 
    } 
  } 
  return true; 
}; 
goog.structs.StringSet.prototype.equals = function(stringSet) { 
  return this.isSubsetOf(stringSet) && stringSet.isSubsetOf(this); 
}; 
goog.structs.StringSet.prototype.forEach = function(f, opt_obj) { 
  for(var key in this.elements_) { 
    if(this.elements_.hasOwnProperty(key)) { 
      f.call(opt_obj, this.decode(key), undefined, this); 
    } 
  } 
}; 
goog.structs.StringSet.prototype.getCount = function() { 
  var count = 0; 
  for(var key in this.elements_) { 
    if(this.elements_.hasOwnProperty(key)) { 
      count ++; 
    } 
  } 
  return count; 
}; 
goog.structs.StringSet.prototype.getDifference = function(stringSet) { 
  var ret = new goog.structs.StringSet; 
  ret.addDifference_(this, stringSet); 
  return ret; 
}; 
goog.structs.StringSet.prototype.getIntersection = function(stringSet) { 
  var ret = new goog.structs.StringSet; 
  for(var key in this.elements_) { 
    if(stringSet.elements_.hasOwnProperty(key) && this.elements_.hasOwnProperty(key)) { 
      ret.elements_[key]= null; 
    } 
  } 
  return ret; 
}; 
goog.structs.StringSet.prototype.getSymmetricDifference = function(stringSet) { 
  var ret = new goog.structs.StringSet; 
  ret.addDifference_(this, stringSet); 
  ret.addDifference_(stringSet, this); 
  return ret; 
}; 
goog.structs.StringSet.prototype.getUnion = function(stringSet) { 
  var ret = this.clone(); 
  ret.addSet(stringSet); 
  return ret; 
}; 
goog.structs.StringSet.prototype.getValues = function() { 
  var ret =[]; 
  for(var key in this.elements_) { 
    if(this.elements_.hasOwnProperty(key)) { 
      ret.push(this.decode(key)); 
    } 
  } 
  return ret; 
}; 
goog.structs.StringSet.prototype.isDisjoint = function(stringSet) { 
  for(var key in this.elements_) { 
    if(stringSet.elements_.hasOwnProperty(key) && this.elements_.hasOwnProperty(key)) { 
      return false; 
    } 
  } 
  return true; 
}; 
goog.structs.StringSet.prototype.isEmpty = function() { 
  for(var key in this.elements_) { 
    if(this.elements_.hasOwnProperty(key)) { 
      return false; 
    } 
  } 
  return true; 
}; 
goog.structs.StringSet.prototype.isSubsetOf = function(stringSet) { 
  for(var key in this.elements_) { 
    if(! stringSet.elements_.hasOwnProperty(key) && this.elements_.hasOwnProperty(key)) { 
      return false; 
    } 
  } 
  return true; 
}; 
goog.structs.StringSet.prototype.isSupersetOf = function(stringSet) { 
  return this.isSubsetOf.call(stringSet, this); 
}; 
goog.structs.StringSet.prototype.remove = function(element) { 
  var key = this.encode(element); 
  if(this.elements_.hasOwnProperty(key)) { 
    delete this.elements_[key]; 
    return true; 
  } 
  return false; 
}; 
goog.structs.StringSet.prototype.removeArray = function(arr) { 
  for(var i = 0; i < arr.length; i ++) { 
    delete this.elements_[this.encode(arr[i])]; 
  } 
}; 
goog.structs.StringSet.prototype.removeSet = function(stringSet) { 
  for(var key in stringSet.elements_) { 
    delete this.elements_[key]; 
  } 
}; 
goog.structs.StringSet.prototype.__iterator__ = function(opt_keys) { 
  return goog.iter.toIterator(this.getValues()); 
}; 

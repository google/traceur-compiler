
goog.provide('goog.testing.PropertyReplacer'); 
goog.require('goog.userAgent'); 
goog.testing.PropertyReplacer = function() { 
  this.original_ =[]; 
}; 
goog.testing.PropertyReplacer.NO_SUCH_KEY_ = { }; 
goog.testing.PropertyReplacer.hasKey_ = function(obj, key) { 
  if(!(key in obj)) { 
    return false; 
  } 
  if(Object.prototype.hasOwnProperty.call(obj, key)) { 
    return true; 
  } 
  if(obj.constructor == Object &&(! goog.userAgent.OPERA || Object.prototype.toString.call(obj) == '[object Object]')) { 
    return false; 
  } 
  try { 
    var dummy = obj.constructor.prototype[key]; 
  } catch(e) { 
    return true; 
  } 
  return !(key in obj.constructor.prototype); 
}; 
goog.testing.PropertyReplacer.deleteKey_ = function(obj, key) { 
  try { 
    delete obj[key]; 
    if(! goog.testing.PropertyReplacer.hasKey_(obj, key)) { 
      return; 
    } 
  } catch(e) { } 
  obj[key]= undefined; 
  if(obj[key]== 'undefined') { 
    obj[key]= ''; 
  } 
}; 
goog.testing.PropertyReplacer.prototype.set = function(obj, key, value) { 
  var origValue = goog.testing.PropertyReplacer.hasKey_(obj, key) ? obj[key]: goog.testing.PropertyReplacer.NO_SUCH_KEY_; 
  this.original_.push({ 
    object: obj, 
    key: key, 
    value: origValue 
  }); 
  obj[key]= value; 
}; 
goog.testing.PropertyReplacer.prototype.replace = function(obj, key, value) { 
  if(!(key in obj)) { 
    throw Error('Cannot replace missing property "' + key + '" in ' + obj); 
  } 
  if(goog.typeOf(obj[key]) != goog.typeOf(value)) { 
    throw Error('Cannot replace property "' + key + '" in ' + obj + ' with a value of different type'); 
  } 
  this.set(obj, key, value); 
}; 
goog.testing.PropertyReplacer.prototype.setPath = function(path, value) { 
  var parts = path.split('.'); 
  var obj = goog.global; 
  for(var i = 0; i < parts.length - 1; i ++) { 
    var part = parts[i]; 
    if(part == 'prototype' && ! obj[part]) { 
      throw Error('Cannot set the prototype of ' + parts.slice(0, i).join('.')); 
    } 
    if(! goog.isObject(obj[part]) && ! goog.isFunction(obj[part])) { 
      this.set(obj, part, { }); 
    } 
    obj = obj[part]; 
  } 
  this.set(obj, parts[parts.length - 1], value); 
}; 
goog.testing.PropertyReplacer.prototype.remove = function(obj, key) { 
  if(goog.testing.PropertyReplacer.hasKey_(obj, key)) { 
    this.original_.push({ 
      object: obj, 
      key: key, 
      value: obj[key]
    }); 
    goog.testing.PropertyReplacer.deleteKey_(obj, key); 
  } 
}; 
goog.testing.PropertyReplacer.prototype.reset = function() { 
  for(var i = this.original_.length - 1; i >= 0; i --) { 
    var original = this.original_[i]; 
    if(original.value == goog.testing.PropertyReplacer.NO_SUCH_KEY_) { 
      goog.testing.PropertyReplacer.deleteKey_(original.object, original.key); 
    } else { 
      original.object[original.key]= original.value; 
    } 
    delete this.original_[i]; 
  } 
  this.original_.length = 0; 
}; 

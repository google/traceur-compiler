
goog.provide('goog.ds.AbstractFastDataNode'); 
goog.provide('goog.ds.FastDataNode'); 
goog.provide('goog.ds.FastListNode'); 
goog.provide('goog.ds.PrimitiveFastDataNode'); 
goog.require('goog.ds.DataManager'); 
goog.require('goog.ds.EmptyNodeList'); 
goog.require('goog.string'); 
goog.ds.AbstractFastDataNode = function(dataName, opt_parent) { 
  if(! dataName) { 
    throw Error('Cannot create a fast data node without a data name'); 
  } 
  this['__dataName']= dataName; 
  this['__parent']= opt_parent; 
}; 
goog.ds.AbstractFastDataNode.prototype.getDataName = function() { 
  return this['__dataName']; 
}; 
goog.ds.AbstractFastDataNode.prototype.setDataName = function(value) { 
  this['__dataName']= value; 
}; 
goog.ds.AbstractFastDataNode.prototype.getDataPath = function() { 
  var parentPath; 
  if(this['__parent']) { 
    parentPath = this['__parent'].getDataPath() + goog.ds.STR_PATH_SEPARATOR; 
  } else { 
    parentPath = ''; 
  } 
  return parentPath + this.getDataName(); 
}; 
goog.ds.FastDataNode = function(root, dataName, opt_parent) { 
  goog.ds.AbstractFastDataNode.call(this, dataName, opt_parent); 
  this.extendWith_(root); 
}; 
goog.inherits(goog.ds.FastDataNode, goog.ds.AbstractFastDataNode); 
goog.ds.FastDataNode.prototype.extendWith_ = function(object) { 
  for(var key in object) { 
    this[key]= object[key]; 
  } 
}; 
goog.ds.FastDataNode.fromJs = function(object, dataName, opt_parent) { 
  if(goog.isArray(object)) { 
    return new goog.ds.FastListNode(object, dataName, opt_parent); 
  } else if(goog.isObject(object)) { 
    return new goog.ds.FastDataNode(object, dataName, opt_parent); 
  } else { 
    return new goog.ds.PrimitiveFastDataNode(object || ! ! object, dataName, opt_parent); 
  } 
}; 
goog.ds.FastDataNode.emptyList_ = new goog.ds.EmptyNodeList(); 
goog.ds.FastDataNode.prototype.set = function(value) { 
  throw 'Not implemented yet'; 
}; 
goog.ds.FastDataNode.prototype.getChildNodes = function(opt_selector) { 
  if(! opt_selector || opt_selector == goog.ds.STR_ALL_CHILDREN_SELECTOR) { 
    return this; 
  } else if(opt_selector.indexOf(goog.ds.STR_WILDCARD) == - 1) { 
    var child = this.getChildNode(opt_selector); 
    return child ? new goog.ds.FastListNode([child], ''): new goog.ds.EmptyNodeList(); 
  } else { 
    throw Error('Unsupported selector: ' + opt_selector); 
  } 
}; 
goog.ds.FastDataNode.prototype.wrapChild_ = function(name) { 
  var child = this[name]; 
  if(child != null && ! child.getDataName) { 
    this[name]= goog.ds.FastDataNode.fromJs(this[name], name, this); 
  } 
}; 
goog.ds.FastDataNode.prototype.getChildNode = function(name, opt_create) { 
  this.wrapChild_(name); 
  var child = this[name]|| null; 
  if(child == null && opt_create) { 
    child = new goog.ds.FastDataNode({ }, name, this); 
    this[name]= child; 
  } 
  return child; 
}; 
goog.ds.FastDataNode.prototype.setChildNode = function(name, value) { 
  if(value != null) { 
    this[name]= value; 
  } else { 
    delete this[name]; 
  } 
  goog.ds.DataManager.getInstance().fireDataChange(this.getDataPath() + goog.ds.STR_PATH_SEPARATOR + name); 
  return null; 
}; 
goog.ds.FastDataNode.prototype.getChildNodeValue = function(name) { 
  var child = this[name]; 
  if(child != null) { 
    return(child.getDataName ? child.get(): child); 
  } else { 
    return null; 
  } 
}; 
goog.ds.FastDataNode.prototype.isList = function() { 
  return false; 
}; 
goog.ds.FastDataNode.prototype.getJsObject = function() { 
  var result = { }; 
  for(var key in this) { 
    if(! goog.string.startsWith(key, '__') && ! goog.isFunction(this[key])) { 
      result[key]=(this[key]['__dataName']? this[key].getJsObject(): this[key]); 
    } 
  } 
  return result; 
}; 
goog.ds.FastDataNode.prototype.clone = function() { 
  return(goog.ds.FastDataNode.fromJs(this.getJsObject(), this.getDataName())); 
}; 
goog.ds.FastDataNode.prototype.add = function(value) { 
  this.setChildNode(value.getDataName(), value); 
}; 
goog.ds.FastDataNode.prototype.get = function(opt_key) { 
  if(! goog.isDef(opt_key)) { 
    return this; 
  } else { 
    return this.getChildNode(opt_key); 
  } 
}; 
goog.ds.FastDataNode.prototype.getByIndex = function(index) { 
  var i = 0; 
  for(var key in this) { 
    if(! goog.string.startsWith(key, '__') && ! goog.isFunction(this[key])) { 
      if(i == index) { 
        this.wrapChild_(key); 
        return this[key]; 
      } 
      ++ i; 
    } 
  } 
  return null; 
}; 
goog.ds.FastDataNode.prototype.getCount = function() { 
  var count = 0; 
  for(var key in this) { 
    if(! goog.string.startsWith(key, '__') && ! goog.isFunction(this[key])) { 
      ++ count; 
    } 
  } 
  return count; 
}; 
goog.ds.FastDataNode.prototype.setNode = function(name, value) { 
  this.setChildNode(name, value); 
}; 
goog.ds.FastDataNode.prototype.removeNode = function(name) { 
  delete this[name]; 
  return false; 
}; 
goog.ds.PrimitiveFastDataNode = function(value, dataName, opt_parent) { 
  this.value_ = value; 
  goog.ds.AbstractFastDataNode.call(this, dataName, opt_parent); 
}; 
goog.inherits(goog.ds.PrimitiveFastDataNode, goog.ds.AbstractFastDataNode); 
goog.ds.PrimitiveFastDataNode.prototype.get = function() { 
  return this.value_; 
}; 
goog.ds.PrimitiveFastDataNode.prototype.set = function(value) { 
  if(goog.isArray(value) || goog.isObject(value)) { 
    throw 'can only set PrimitiveFastDataNode to primitive values'; 
  } 
  this.value_ = value; 
  goog.ds.DataManager.getInstance().fireDataChange(this.getDataPath()); 
}; 
goog.ds.PrimitiveFastDataNode.prototype.getChildNodes = function() { 
  return goog.ds.FastDataNode.emptyList_; 
}; 
goog.ds.PrimitiveFastDataNode.prototype.getChildNode = function(name) { 
  return null; 
}; 
goog.ds.PrimitiveFastDataNode.prototype.getChildNodeValue = function(name) { 
  return null; 
}; 
goog.ds.PrimitiveFastDataNode.prototype.setChildNode = function(name, value) { 
  throw Error('Cannot set a child node for a PrimitiveFastDataNode'); 
}; 
goog.ds.PrimitiveFastDataNode.prototype.isList = function() { 
  return false; 
}; 
goog.ds.PrimitiveFastDataNode.prototype.getJsObject = function() { 
  return this.value_; 
}; 
goog.ds.FastListNode = function(values, dataName, opt_parent) { 
  this.values_ =[]; 
  for(var i = 0; i < values.length; ++ i) { 
    var name = values[i].id ||('[' + i + ']'); 
    this.values_.push(goog.ds.FastDataNode.fromJs(values[i], name, this)); 
    if(values[i].id) { 
      if(! this.map_) { 
        this.map_ = { }; 
      } 
      this.map_[values[i].id]= i; 
    } 
  } 
  goog.ds.AbstractFastDataNode.call(this, dataName, opt_parent); 
}; 
goog.inherits(goog.ds.FastListNode, goog.ds.AbstractFastDataNode); 
goog.ds.FastListNode.prototype.set = function(value) { 
  throw Error('Cannot set a FastListNode to a new value'); 
}; 
goog.ds.FastListNode.prototype.getChildNodes = function() { 
  return this; 
}; 
goog.ds.FastListNode.prototype.getChildNode = function(key, opt_create) { 
  var index = this.getKeyAsNumber_(key); 
  if(index == null && this.map_) { 
    index = this.map_[key]; 
  } 
  if(index != null && this.values_[index]) { 
    return this.values_[index]; 
  } else if(opt_create) { 
    this.setChildNode(key, { }); 
    return this.getChildNode(key); 
  } else { 
    return null; 
  } 
}; 
goog.ds.FastListNode.prototype.getChildNodeValue = function(key) { 
  var child = this.getChildNode(key); 
  return(child ? child.get(): null); 
}; 
goog.ds.FastListNode.prototype.getKeyAsNumber_ = function(key) { 
  if(key.charAt(0) == '[' && key.charAt(key.length - 1) == ']') { 
    return Number(key.substring(1, key.length - 1)); 
  } else { 
    return null; 
  } 
}; 
goog.ds.FastListNode.prototype.setChildNode = function(key, value) { 
  var count = this.values_.length; 
  if(value != null) { 
    if(! value.getDataName) { 
      value = goog.ds.FastDataNode.fromJs(value, key, this); 
    } 
    var index = this.getKeyAsNumber_(key); 
    if(index != null) { 
      if(index < 0 || index >= this.values_.length) { 
        throw Error('List index out of bounds: ' + index); 
      } 
      this.values_[key]= value; 
    } else { 
      if(! this.map_) { 
        this.map_ = { }; 
      } 
      this.values_.push(value); 
      this.map_[key]= this.values_.length - 1; 
    } 
  } else { 
    this.removeNode(key); 
  } 
  var dm = goog.ds.DataManager.getInstance(); 
  dm.fireDataChange(this.getDataPath() + goog.ds.STR_PATH_SEPARATOR + key); 
  if(this.values_.length != count) { 
    this.listSizeChanged_(); 
  } 
  return null; 
}; 
goog.ds.FastListNode.prototype.listSizeChanged_ = function() { 
  var dm = goog.ds.DataManager.getInstance(); 
  dm.fireDataChange(this.getDataPath()); 
  dm.fireDataChange(this.getDataPath() + goog.ds.STR_PATH_SEPARATOR + 'count()'); 
}; 
goog.ds.FastListNode.prototype.isList = function() { 
  return true; 
}; 
goog.ds.FastListNode.prototype.getJsObject = function() { 
  var result =[]; 
  for(var i = 0; i < this.values_.length; ++ i) { 
    result.push(this.values_[i].getJsObject()); 
  } 
  return result; 
}; 
goog.ds.FastListNode.prototype.add = function(value) { 
  if(! value.getDataName) { 
    value = goog.ds.FastDataNode.fromJs(value, String('[' +(this.values_.length) + ']'), this); 
  } 
  this.values_.push(value); 
  var dm = goog.ds.DataManager.getInstance(); 
  dm.fireDataChange(this.getDataPath() + goog.ds.STR_PATH_SEPARATOR + '[' +(this.values_.length - 1) + ']'); 
  this.listSizeChanged_(); 
}; 
goog.ds.FastListNode.prototype.get = function(opt_key) { 
  if(! goog.isDef(opt_key)) { 
    return this.values_; 
  } else { 
    return this.getChildNode(opt_key); 
  } 
}; 
goog.ds.FastListNode.prototype.getByIndex = function(index) { 
  var child = this.values_[index]; 
  return(child != null ? child: null); 
}; 
goog.ds.FastListNode.prototype.getCount = function() { 
  return this.values_.length; 
}; 
goog.ds.FastListNode.prototype.setNode = function(name, value) { 
  throw Error('Setting child nodes of a FastListNode is not implemented, yet'); 
}; 
goog.ds.FastListNode.prototype.removeNode = function(name) { 
  var index = this.getKeyAsNumber_(name); 
  if(index == null && this.map_) { 
    index = this.map_[name]; 
  } 
  if(index != null) { 
    this.values_.splice(index, 1); 
    if(this.map_) { 
      var keyToDelete = null; 
      for(var key in this.map_) { 
        if(this.map_[key]== index) { 
          keyToDelete = key; 
        } else if(this.map_[key]> index) { 
          -- this.map_[key]; 
        } 
      } 
      if(keyToDelete) { 
        delete this.map_[keyToDelete]; 
      } 
    } 
    var dm = goog.ds.DataManager.getInstance(); 
    dm.fireDataChange(this.getDataPath() + goog.ds.STR_PATH_SEPARATOR + '[' + index + ']'); 
    this.listSizeChanged_(); 
  } 
  return false; 
}; 
goog.ds.FastListNode.prototype.indexOf = function(name) { 
  var index = this.getKeyAsNumber_(name); 
  if(index == null && this.map_) { 
    index = this.map_[name]; 
  } 
  if(index == null) { 
    throw Error('Cannot determine index for: ' + name); 
  } 
  return(index); 
}; 

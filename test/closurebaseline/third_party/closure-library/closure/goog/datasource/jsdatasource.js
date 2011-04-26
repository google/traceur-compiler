
goog.provide('goog.ds.JsDataSource'); 
goog.provide('goog.ds.JsPropertyDataSource'); 
goog.require('goog.ds.BaseDataNode'); 
goog.require('goog.ds.BasicNodeList'); 
goog.require('goog.ds.DataManager'); 
goog.require('goog.ds.EmptyNodeList'); 
goog.require('goog.ds.LoadState'); 
goog.ds.JsDataSource = function(root, dataName, opt_parent) { 
  this.parent_ = opt_parent; 
  this.dataName_ = dataName; 
  this.setRoot(root); 
}; 
goog.ds.JsDataSource.prototype.root_; 
goog.ds.JsDataSource.prototype.setRoot = function(root) { 
  this.root_ = root; 
  this.childNodeList_ = null; 
}; 
goog.ds.JsDataSource.prototype.setIsList_ = function(isList) { 
  this.isList_ = isList; 
}; 
goog.ds.JsDataSource.prototype.get = function() { 
  return ! goog.isObject(this.root_) ? this.root_: this.getChildNodes(); 
}; 
goog.ds.JsDataSource.prototype.set = function(value) { 
  if(value && goog.isObject(this.root_)) { 
    throw Error('Can\'t set group nodes to new values yet'); 
  } 
  if(this.parent_) { 
    this.parent_.root_[this.dataName_]= value; 
  } 
  this.root_ = value; 
  this.childNodeList_ = null; 
  goog.ds.DataManager.getInstance().fireDataChange(this.getDataPath()); 
}; 
goog.ds.JsDataSource.prototype.getChildNodes = function(opt_selector) { 
  if(! this.root_) { 
    return new goog.ds.EmptyNodeList(); 
  } 
  if(! opt_selector || opt_selector == goog.ds.STR_ALL_CHILDREN_SELECTOR) { 
    this.createChildNodes_(false); 
    return this.childNodeList_; 
  } else if(opt_selector.indexOf(goog.ds.STR_WILDCARD) == - 1) { 
    if(this.root_[opt_selector]!= null) { 
      return new goog.ds.BasicNodeList([this.getChildNode(opt_selector)]); 
    } else { 
      return new goog.ds.EmptyNodeList(); 
    } 
  } else { 
    throw Error('Selector not supported yet (' + opt_selector + ')'); 
  } 
}; 
goog.ds.JsDataSource.prototype.createChildNodes_ = function(opt_force) { 
  if(this.childNodeList_ && ! opt_force) { 
    return; 
  } 
  if(! goog.isObject(this.root_)) { 
    this.childNodeList_ = new goog.ds.EmptyNodeList(); 
    return; 
  } 
  var childNodeList = new goog.ds.BasicNodeList(); 
  var newNode; 
  if(goog.isArray(this.root_)) { 
    var len = this.root_.length; 
    for(var i = 0; i < len; i ++) { 
      var node = this.root_[i]; 
      var id = node.id; 
      var name = id != null ? String(id): '[' + i + ']'; 
      newNode = new goog.ds.JsDataSource(node, name, this); 
      childNodeList.add(newNode); 
    } 
  } else { 
    for(var name in this.root_) { 
      var obj = this.root_[name]; 
      if(obj.getDataName) { 
        childNodeList.add(obj); 
      } else if(! goog.isFunction(obj)) { 
        newNode = new goog.ds.JsDataSource(obj, name, this); 
        childNodeList.add(newNode); 
      } 
    } 
  } 
  this.childNodeList_ = childNodeList; 
}; 
goog.ds.JsDataSource.prototype.getChildNode = function(name, opt_canCreate) { 
  if(! this.root_) { 
    return null; 
  } 
  var node = this.getChildNodes().get(name); 
  if(! node && opt_canCreate) { 
    var newObj = { }; 
    if(goog.isArray(this.root_)) { 
      newObj['id']= name; 
      this.root_.push(newObj); 
    } else { 
      this.root_[name]= newObj; 
    } 
    node = new goog.ds.JsDataSource(newObj, name, this); 
    if(this.childNodeList_) { 
      this.childNodeList_.add(node); 
    } 
  } 
  return node; 
}; 
goog.ds.JsDataSource.prototype.getChildNodeValue = function(name) { 
  if(this.childNodeList_) { 
    var node = this.getChildNodes().get(name); 
    return node ? node.get(): null; 
  } else if(this.root_) { 
    return this.root_[name]; 
  } else { 
    return null; 
  } 
}; 
goog.ds.JsDataSource.prototype.setChildNode = function(name, value) { 
  var removedPath = null; 
  var node = null; 
  var addedNode = false; 
  if(value != null) { 
    if(value.getDataName) { 
      node = value; 
      node.parent_ = this; 
    } else { 
      if(goog.isArray(value) || goog.isObject(value)) { 
        node = new goog.ds.JsDataSource(value, name, this); 
      } else { 
        node = new goog.ds.JsPropertyDataSource((this.root_), name, this); 
      } 
    } 
  } 
  if(goog.isArray(this.root_)) { 
    this.createChildNodes_(); 
    var index = this.childNodeList_.indexOf(name); 
    if(value == null) { 
      var nodeToRemove = this.childNodeList_.get(name); 
      if(nodeToRemove) { 
        removedPath = nodeToRemove.getDataPath(); 
      } 
      this.root_.splice(index, 1); 
    } else { 
      if(index) { 
        this.root_[index]= value; 
      } else { 
        this.root_.push(value); 
      } 
    } 
    if(index == null) { 
      addedNode = true; 
    } 
    this.childNodeList_.setNode(name,(node)); 
  } else if(goog.isObject(this.root_)) { 
    if(value == null) { 
      this.createChildNodes_(); 
      var nodeToRemove = this.childNodeList_.get(name); 
      if(nodeToRemove) { 
        removedPath = nodeToRemove.getDataPath(); 
      } 
      delete this.root_[name]; 
    } else { 
      if(! this.root_[name]) { 
        addedNode = true; 
      } 
      this.root_[name]= value; 
    } 
    if(this.childNodeList_) { 
      this.childNodeList_.setNode(name,(node)); 
    } 
  } 
  var dm = goog.ds.DataManager.getInstance(); 
  if(node) { 
    dm.fireDataChange(node.getDataPath()); 
    if(addedNode && this.isList()) { 
      dm.fireDataChange(this.getDataPath()); 
      dm.fireDataChange(this.getDataPath() + '/count()'); 
    } 
  } else if(removedPath) { 
    dm.fireDataChange(removedPath); 
    if(this.isList()) { 
      dm.fireDataChange(this.getDataPath()); 
      dm.fireDataChange(this.getDataPath() + '/count()'); 
    } 
  } 
  return node; 
}; 
goog.ds.JsDataSource.prototype.getDataName = function() { 
  return this.dataName_; 
}; 
goog.ds.JsDataSource.prototype.setDataName = function(dataName) { 
  this.dataName_ = dataName; 
}; 
goog.ds.JsDataSource.prototype.getDataPath = function() { 
  var parentPath = ''; 
  if(this.parent_) { 
    parentPath = this.parent_.getDataPath() + goog.ds.STR_PATH_SEPARATOR; 
  } 
  return parentPath + this.dataName_; 
}; 
goog.ds.JsDataSource.prototype.load = function() { }; 
goog.ds.JsDataSource.prototype.getLoadState = function() { 
  return(this.root_ == null) ? goog.ds.LoadState.NOT_LOADED: goog.ds.LoadState.LOADED; 
}; 
goog.ds.JsDataSource.prototype.isList = function() { 
  return this.isList_ != null ? this.isList_: goog.isArray(this.root_); 
}; 
goog.ds.JsPropertyDataSource = function(parent, dataName, opt_parentDataNode) { 
  goog.ds.BaseDataNode.call(this); 
  this.dataName_ = dataName; 
  this.parent_ = parent; 
  this.parentDataNode_ = opt_parentDataNode || this.parent_; 
}; 
goog.inherits(goog.ds.JsPropertyDataSource, goog.ds.BaseDataNode); 
goog.ds.JsPropertyDataSource.prototype.get = function() { 
  return this.parent_[this.dataName_]; 
}; 
goog.ds.JsPropertyDataSource.prototype.set = function(value) { 
  var oldValue = this.parent_[this.dataName_]; 
  this.parent_[this.dataName_]= value; 
  if(oldValue != value) { 
    goog.ds.DataManager.getInstance().fireDataChange(this.getDataPath()); 
  } 
}; 
goog.ds.JsPropertyDataSource.prototype.getDataName = function() { 
  return this.dataName_; 
}; 
goog.ds.JsPropertyDataSource.prototype.getParent_ = function() { 
  return this.parentDataNode_; 
}; 

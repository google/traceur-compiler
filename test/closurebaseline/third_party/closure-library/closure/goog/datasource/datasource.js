
goog.provide('goog.ds.BaseDataNode'); 
goog.provide('goog.ds.BasicNodeList'); 
goog.provide('goog.ds.DataNode'); 
goog.provide('goog.ds.DataNodeList'); 
goog.provide('goog.ds.EmptyNodeList'); 
goog.provide('goog.ds.LoadState'); 
goog.provide('goog.ds.SortedNodeList'); 
goog.provide('goog.ds.Util'); 
goog.provide('goog.ds.logger'); 
goog.require('goog.array'); 
goog.require('goog.debug.Logger'); 
goog.ds.DataNode = function() { }; 
goog.ds.DataNode.prototype.get = goog.nullFunction; 
goog.ds.DataNode.prototype.set = goog.nullFunction; 
goog.ds.DataNode.prototype.getChildNodes = goog.nullFunction; 
goog.ds.DataNode.prototype.getChildNode = goog.nullFunction; 
goog.ds.DataNode.prototype.getChildNodeValue = goog.nullFunction; 
goog.ds.DataNode.prototype.setChildNode = goog.nullFunction; 
goog.ds.DataNode.prototype.getDataName = goog.nullFunction; 
goog.ds.DataNode.prototype.setDataName = goog.nullFunction; 
goog.ds.DataNode.prototype.getDataPath = goog.nullFunction; 
goog.ds.DataNode.prototype.load = goog.nullFunction; 
goog.ds.DataNode.prototype.getLoadState = null; 
goog.ds.DataNode.prototype.isList = goog.nullFunction; 
goog.ds.LoadState = { 
  LOADED: 'LOADED', 
  LOADING: 'LOADING', 
  FAILED: 'FAILED', 
  NOT_LOADED: 'NOT_LOADED' 
}; 
goog.ds.BaseDataNode = function() { }; 
goog.ds.BaseDataNode.prototype.set = goog.nullFunction; 
goog.ds.BaseDataNode.prototype.getChildNodes = function(opt_selector) { 
  return new goog.ds.EmptyNodeList(); 
}; 
goog.ds.BaseDataNode.prototype.getChildNode = function(name, opt_canCreate) { 
  return null; 
}; 
goog.ds.BaseDataNode.prototype.getChildNodeValue = function(name) { 
  return null; 
}; 
goog.ds.BaseDataNode.prototype.getDataName = goog.nullFunction; 
goog.ds.BaseDataNode.prototype.getDataPath = function() { 
  var parentPath = ''; 
  var myName = this.getDataName(); 
  if(this.getParent_ && this.getParent_()) { 
    parentPath = this.getParent_().getDataPath() +(myName.indexOf(goog.ds.STR_ARRAY_START) != - 1 ? '': goog.ds.STR_PATH_SEPARATOR); 
  } 
  return parentPath + myName; 
}; 
goog.ds.BaseDataNode.prototype.load = goog.nullFunction; 
goog.ds.BaseDataNode.prototype.getLoadState = function() { 
  return goog.ds.LoadState.LOADED; 
}; 
goog.ds.BaseDataNode.prototype.getParent_ = null; 
goog.ds.DataNodeList = function() { }; 
goog.ds.DataNodeList.prototype.add = goog.nullFunction; 
goog.ds.DataNodeList.prototype.get = goog.nullFunction; 
goog.ds.DataNodeList.prototype.getByIndex = goog.nullFunction; 
goog.ds.DataNodeList.prototype.getCount = goog.nullFunction; 
goog.ds.DataNodeList.prototype.setNode = goog.nullFunction; 
goog.ds.DataNodeList.prototype.removeNode = goog.nullFunction; 
goog.ds.BasicNodeList = function(opt_nodes) { 
  this.map_ = { }; 
  this.list_ =[]; 
  this.indexMap_ = { }; 
  if(opt_nodes) { 
    for(var i = 0, node; node = opt_nodes[i]; i ++) { 
      this.add(node); 
    } 
  } 
}; 
goog.ds.BasicNodeList.prototype.add = function(node) { 
  this.list_.push(node); 
  var dataName = node.getDataName(); 
  if(dataName) { 
    this.map_[dataName]= node; 
    this.indexMap_[dataName]= this.list_.length - 1; 
  } 
}; 
goog.ds.BasicNodeList.prototype.get = function(key) { 
  return this.map_[key]|| null; 
}; 
goog.ds.BasicNodeList.prototype.getByIndex = function(index) { 
  return this.list_[index]|| null; 
}; 
goog.ds.BasicNodeList.prototype.getCount = function() { 
  return this.list_.length; 
}; 
goog.ds.BasicNodeList.prototype.setNode = function(name, node) { 
  if(node == null) { 
    this.removeNode(name); 
  } else { 
    var existingNode = this.indexMap_[name]; 
    if(existingNode != null) { 
      this.map_[name]= node; 
      this.list_[existingNode]= node; 
    } else { 
      this.add(node); 
    } 
  } 
}; 
goog.ds.BasicNodeList.prototype.removeNode = function(name) { 
  var existingNode = this.indexMap_[name]; 
  if(existingNode != null) { 
    this.list_.splice(existingNode, 1); 
    delete this.map_[name]; 
    delete this.indexMap_[name]; 
    for(var index in this.indexMap_) { 
      if(this.indexMap_[index]> existingNode) { 
        this.indexMap_[index]--; 
      } 
    } 
  } 
  return existingNode != null; 
}; 
goog.ds.BasicNodeList.prototype.indexOf = function(name) { 
  return this.indexMap_[name]; 
}; 
goog.ds.EmptyNodeList = function() { 
  goog.ds.BasicNodeList.call(this); 
}; 
goog.inherits(goog.ds.EmptyNodeList, goog.ds.BasicNodeList); 
goog.ds.EmptyNodeList.prototype.add = function(node) { 
  throw Error('Can\'t add to EmptyNodeList'); 
}; 
goog.ds.SortedNodeList = function(compareFn, opt_nodes) { 
  this.compareFn_ = compareFn; 
  goog.ds.BasicNodeList.call(this, opt_nodes); 
}; 
goog.inherits(goog.ds.SortedNodeList, goog.ds.BasicNodeList); 
goog.ds.SortedNodeList.prototype.add = function(node) { 
  if(! this.compareFn_) { 
    this.append(node); 
    return; 
  } 
  var searchLoc = goog.array.binarySearch(this.list_, node, this.compareFn_); 
  if(searchLoc < 0) { 
    searchLoc = -(searchLoc + 1); 
  } 
  for(var index in this.indexMap_) { 
    if(this.indexMap_[index]>= searchLoc) { 
      this.indexMap_[index]++; 
    } 
  } 
  goog.array.insertAt(this.list_, node, searchLoc); 
  var dataName = node.getDataName(); 
  if(dataName) { 
    this.map_[dataName]= node; 
    this.indexMap_[dataName]= searchLoc; 
  } 
}; 
goog.ds.SortedNodeList.prototype.append = function(node) { 
  goog.ds.SortedNodeList.superClass_.add.call(this, node); 
}; 
goog.ds.SortedNodeList.prototype.setNode = function(name, node) { 
  if(node == null) { 
    this.removeNode(name); 
  } else { 
    var existingNode = this.indexMap_[name]; 
    if(existingNode != null) { 
      if(this.compareFn_) { 
        var compareResult = this.compareFn_(this.list_[existingNode], node); 
        if(compareResult == 0) { 
          this.map_[name]= node; 
          this.list_[existingNode]= node; 
        } else { 
          this.removeNode(name); 
          this.add(node); 
        } 
      } 
    } else { 
      this.add(node); 
    } 
  } 
}; 
goog.ds.STR_ATTRIBUTE_START_ = '@'; 
goog.ds.STR_ALL_CHILDREN_SELECTOR = '*'; 
goog.ds.STR_WILDCARD = '*'; 
goog.ds.STR_PATH_SEPARATOR = '/'; 
goog.ds.STR_ARRAY_START = '['; 
goog.ds.logger = goog.debug.Logger.getLogger('goog.ds'); 
goog.ds.Util.makeReferenceNode = function(node, name) { 
  var nodeCreator = function() { }; 
  nodeCreator.prototype = node; 
  var newNode = new nodeCreator(); 
  newNode.getDataName = function() { 
    return name; 
  }; 
  return newNode; 
}; 


goog.provide('goog.ds.DataManager'); 
goog.require('goog.ds.BasicNodeList'); 
goog.require('goog.ds.DataNode'); 
goog.require('goog.ds.Expr'); 
goog.require('goog.string'); 
goog.require('goog.structs'); 
goog.require('goog.structs.Map'); 
goog.ds.DataManager = function() { 
  this.dataSources_ = new goog.ds.BasicNodeList(); 
  this.autoloads_ = new goog.structs.Map(); 
  this.listenerMap_ = { }; 
  this.listenersByFunction_ = { }; 
  this.aliases_ = { }; 
  this.eventCount_ = 0; 
  this.indexedListenersByFunction_ = { }; 
}; 
goog.ds.DataManager.instance_ = null; 
goog.inherits(goog.ds.DataManager, goog.ds.DataNode); 
goog.ds.DataManager.getInstance = function() { 
  if(! goog.ds.DataManager.instance_) { 
    goog.ds.DataManager.instance_ = new goog.ds.DataManager(); 
  } 
  return goog.ds.DataManager.instance_; 
}; 
goog.ds.DataManager.clearInstance = function() { 
  goog.ds.DataManager.instance_ = null; 
}; 
goog.ds.DataManager.prototype.addDataSource = function(ds, opt_autoload, opt_name) { 
  var autoload = ! ! opt_autoload; 
  var name = opt_name || ds.getDataName(); 
  if(! goog.string.startsWith(name, '$')) { 
    name = '$' + name; 
  } 
  ds.setDataName(name); 
  this.dataSources_.add(ds); 
  this.autoloads_.set(name, autoload); 
}; 
goog.ds.DataManager.prototype.aliasDataSource = function(name, dataPath) { 
  if(! this.aliasListener_) { 
    this.aliasListener_ = goog.bind(this.listenForAlias_, this); 
  } 
  if(this.aliases_[name]) { 
    var oldPath = this.aliases_[name].getSource(); 
    this.removeListeners(this.aliasListener_, oldPath + '/...', name); 
  } 
  this.aliases_[name]= goog.ds.Expr.create(dataPath); 
  this.addListener(this.aliasListener_, dataPath + '/...', name); 
  this.fireDataChange(name); 
}; 
goog.ds.DataManager.prototype.listenForAlias_ = function(dataPath, name) { 
  var aliasedExpr = this.aliases_[name]; 
  if(aliasedExpr) { 
    var aliasedPath = aliasedExpr.getSource(); 
    if(dataPath.indexOf(aliasedPath) == 0) { 
      this.fireDataChange(name + dataPath.substring(aliasedPath.length)); 
    } else { 
      this.fireDataChange(name); 
    } 
  } 
}; 
goog.ds.DataManager.prototype.getDataSource = function(name) { 
  if(this.aliases_[name]) { 
    return this.aliases_[name].getNode(); 
  } else { 
    return this.dataSources_.get(name); 
  } 
}; 
goog.ds.DataManager.prototype.get = function() { 
  return this.dataSources_; 
}; 
goog.ds.DataManager.prototype.set = function(value) { 
  throw Error('Can\'t set on DataManager'); 
}; 
goog.ds.DataManager.prototype.getChildNodes = function(opt_selector) { 
  if(opt_selector) { 
    return new goog.ds.BasicNodeList([this.getChildNode((opt_selector))]); 
  } else { 
    return this.dataSources_; 
  } 
}; 
goog.ds.DataManager.prototype.getChildNode = function(name) { 
  return this.getDataSource(name); 
}; 
goog.ds.DataManager.prototype.getChildNodeValue = function(name) { 
  var ds = this.getDataSource(name); 
  return ds ? ds.get(): null; 
}; 
goog.ds.DataManager.prototype.getDataName = function() { 
  return ''; 
}; 
goog.ds.DataManager.prototype.getDataPath = function() { 
  return ''; 
}; 
goog.ds.DataManager.prototype.load = function() { 
  var len = this.dataSources_.getCount(); 
  for(var i = 0; i < len; i ++) { 
    var ds = this.dataSources_.getByIndex(i); 
    var autoload = this.autoloads_.get(ds.getDataName()); 
    if(autoload) { 
      ds.load(); 
    } 
  } 
}; 
goog.ds.DataManager.prototype.getLoadState = goog.abstractMethod; 
goog.ds.DataManager.prototype.isList = function() { 
  return false; 
}; 
goog.ds.DataManager.prototype.getEventCount = function() { 
  return this.eventCount_; 
}; 
goog.ds.DataManager.prototype.addListener = function(fn, dataPath, opt_id) { 
  var maxAncestors = 0; 
  if(goog.string.endsWith(dataPath, '/...')) { 
    maxAncestors = 1000; 
    dataPath = dataPath.substring(0, dataPath.length - 4); 
  } else if(goog.string.endsWith(dataPath, '/*')) { 
    maxAncestors = 1; 
    dataPath = dataPath.substring(0, dataPath.length - 2); 
  } 
  opt_id = opt_id || ''; 
  var key = dataPath + ':' + opt_id + ':' + goog.getUid(fn); 
  var listener = { 
    dataPath: dataPath, 
    id: opt_id, 
    fn: fn 
  }; 
  var expr = goog.ds.Expr.create(dataPath); 
  var fnUid = goog.getUid(fn); 
  if(! this.listenersByFunction_[fnUid]) { 
    this.listenersByFunction_[fnUid]= { }; 
  } 
  this.listenersByFunction_[fnUid][key]= { 
    listener: listener, 
    items:[]
  }; 
  while(expr) { 
    var listenerSpec = { 
      listener: listener, 
      maxAncestors: maxAncestors 
    }; 
    var matchingListeners = this.listenerMap_[expr.getSource()]; 
    if(matchingListeners == null) { 
      matchingListeners = { }; 
      this.listenerMap_[expr.getSource()]= matchingListeners; 
    } 
    matchingListeners[key]= listenerSpec; 
    maxAncestors = 0; 
    expr = expr.getParent(); 
    this.listenersByFunction_[fnUid][key].items.push({ 
      key: key, 
      obj: matchingListeners 
    }); 
  } 
}; 
goog.ds.DataManager.prototype.addIndexedListener = function(fn, dataPath, opt_id) { 
  var firstStarPos = dataPath.indexOf('*'); 
  if(firstStarPos == - 1) { 
    this.addListener(fn, dataPath, opt_id); 
    return; 
  } 
  var listenPath = dataPath.substring(0, firstStarPos) + '...'; 
  var ext = '$'; 
  if(goog.string.endsWith(dataPath, '/...')) { 
    dataPath = dataPath.substring(0, dataPath.length - 4); 
    ext = ''; 
  } 
  var regExpPath = goog.string.regExpEscape(dataPath); 
  var matchRegExp = regExpPath.replace(/\\\*/g, '([^\\\/]+)') + ext; 
  var matchRegExpRe = new RegExp(matchRegExp); 
  var matcher = function(path, id) { 
    var match = matchRegExpRe.exec(path); 
    if(match) { 
      match.shift(); 
      fn(path, opt_id, match); 
    } 
  }; 
  this.addListener(matcher, listenPath, opt_id); 
  var fnUid = goog.getUid(fn); 
  if(! this.indexedListenersByFunction_[fnUid]) { 
    this.indexedListenersByFunction_[fnUid]= { }; 
  } 
  var key = dataPath + ':' + opt_id; 
  this.indexedListenersByFunction_[fnUid][key]= { listener: { 
      dataPath: listenPath, 
      fn: matcher, 
      id: opt_id 
    } }; 
}; 
goog.ds.DataManager.prototype.removeIndexedListeners = function(fn, opt_dataPath, opt_id) { 
  this.removeListenersByFunction_(this.indexedListenersByFunction_, true, fn, opt_dataPath, opt_id); 
}; 
goog.ds.DataManager.prototype.removeListeners = function(fn, opt_dataPath, opt_id) { 
  if(opt_dataPath && goog.string.endsWith(opt_dataPath, '/...')) { 
    opt_dataPath = opt_dataPath.substring(0, opt_dataPath.length - 4); 
  } else if(opt_dataPath && goog.string.endsWith(opt_dataPath, '/*')) { 
    opt_dataPath = opt_dataPath.substring(0, opt_dataPath.length - 2); 
  } 
  this.removeListenersByFunction_(this.listenersByFunction_, false, fn, opt_dataPath, opt_id); 
}; 
goog.ds.DataManager.prototype.removeListenersByFunction_ = function(listenersByFunction, indexed, fn, opt_dataPath, opt_id) { 
  var fnUid = goog.getUid(fn); 
  var functionMatches = listenersByFunction[fnUid]; 
  if(functionMatches != null) { 
    for(var key in functionMatches) { 
      var functionMatch = functionMatches[key]; 
      var listener = functionMatch.listener; 
      if((! opt_dataPath || opt_dataPath == listener.dataPath) &&(! opt_id || opt_id == listener.id)) { 
        if(indexed) { 
          this.removeListeners(listener.fn, listener.dataPath, listener.id); 
        } 
        if(functionMatch.items) { 
          for(var i = 0; i < functionMatch.items.length; i ++) { 
            var item = functionMatch.items[i]; 
            delete item.obj[item.key]; 
          } 
        } 
        delete functionMatches[key]; 
      } 
    } 
  } 
}; 
goog.ds.DataManager.prototype.getListenerCount = function() { 
  var count = 0; 
  goog.structs.forEach(this.listenerMap_, function(matchingListeners) { 
    count += goog.structs.getCount(matchingListeners); 
  }); 
  return count; 
}; 
goog.ds.DataManager.prototype.runWithoutFiringDataChanges = function(callback) { 
  if(this.disableFiring_) { 
    throw Error('Can not nest calls to runWithoutFiringDataChanges'); 
  } 
  this.disableFiring_ = true; 
  try { 
    callback(); 
  } finally { 
    this.disableFiring_ = false; 
  } 
}; 
goog.ds.DataManager.prototype.fireDataChange = function(dataPath) { 
  if(this.disableFiring_) { 
    return; 
  } 
  var expr = goog.ds.Expr.create(dataPath); 
  var ancestorDepth = 0; 
  while(expr) { 
    var matchingListeners = this.listenerMap_[expr.getSource()]; 
    if(matchingListeners) { 
      for(var id in matchingListeners) { 
        var match = matchingListeners[id]; 
        var listener = match.listener; 
        if(ancestorDepth <= match.maxAncestors) { 
          listener.fn(dataPath, listener.id); 
        } 
      } 
    } 
    ancestorDepth ++; 
    expr = expr.getParent(); 
  } 
  this.eventCount_ ++; 
}; 

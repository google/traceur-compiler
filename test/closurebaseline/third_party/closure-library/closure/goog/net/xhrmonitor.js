
goog.provide('goog.net.xhrMonitor'); 
goog.require('goog.array'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.userAgent'); 
goog.net.XhrMonitor_ = function() { 
  if(! goog.userAgent.GECKO) return; 
  this.contextsToXhr_ = { }; 
  this.xhrToContexts_ = { }; 
  this.stack_ =[]; 
}; 
goog.net.XhrMonitor_.getKey = function(obj) { 
  return goog.isString(obj) ? obj: goog.isObject(obj) ? goog.getUid(obj): ''; 
}; 
goog.net.XhrMonitor_.prototype.logger_ = goog.debug.Logger.getLogger('goog.net.xhrMonitor'); 
goog.net.XhrMonitor_.prototype.enabled_ = goog.userAgent.GECKO; 
goog.net.XhrMonitor_.prototype.setEnabled = function(val) { 
  this.enabled_ = goog.userAgent.GECKO && val; 
}; 
goog.net.XhrMonitor_.prototype.pushContext = function(context) { 
  if(! this.enabled_) return; 
  var key = goog.net.XhrMonitor_.getKey(context); 
  this.logger_.finest('Pushing context: ' + context + ' (' + key + ')'); 
  this.stack_.push(key); 
}; 
goog.net.XhrMonitor_.prototype.popContext = function() { 
  if(! this.enabled_) return; 
  var context = this.stack_.pop(); 
  this.logger_.finest('Popping context: ' + context); 
  this.updateDependentContexts_(context); 
}; 
goog.net.XhrMonitor_.prototype.isContextSafe = function(context) { 
  if(! this.enabled_) return true; 
  var deps = this.contextsToXhr_[goog.net.XhrMonitor_.getKey(context)]; 
  this.logger_.fine('Context is safe : ' + context + ' - ' + deps); 
  return ! deps; 
}; 
goog.net.XhrMonitor_.prototype.markXhrOpen = function(xhr) { 
  if(! this.enabled_) return; 
  var uid = goog.getUid(xhr); 
  this.logger_.fine('Opening XHR : ' + uid); 
  for(var i = 0; i < this.stack_.length; i ++) { 
    var context = this.stack_[i]; 
    this.addToMap_(this.contextsToXhr_, context, uid); 
    this.addToMap_(this.xhrToContexts_, uid, context); 
  } 
}; 
goog.net.XhrMonitor_.prototype.markXhrClosed = function(xhr) { 
  if(! this.enabled_) return; 
  var uid = goog.getUid(xhr); 
  this.logger_.fine('Closing XHR : ' + uid); 
  delete this.xhrToContexts_[uid]; 
  for(var context in this.contextsToXhr_) { 
    goog.array.remove(this.contextsToXhr_[context], uid); 
    if(this.contextsToXhr_[context].length == 0) { 
      delete this.contextsToXhr_[context]; 
    } 
  } 
}; 
goog.net.XhrMonitor_.prototype.updateDependentContexts_ = function(xhrUid) { 
  var contexts = this.xhrToContexts_[xhrUid]; 
  var xhrs = this.contextsToXhr_[xhrUid]; 
  if(contexts && xhrs) { 
    this.logger_.finest('Updating dependent contexts'); 
    goog.array.forEach(contexts, function(context) { 
      goog.array.forEach(xhrs, function(xhr) { 
        this.addToMap_(this.contextsToXhr_, context, xhr); 
        this.addToMap_(this.xhrToContexts_, xhr, context); 
      }, this); 
    }, this); 
  } 
}; 
goog.net.XhrMonitor_.prototype.addToMap_ = function(map, key, value) { 
  if(! map[key]) { 
    map[key]=[]; 
  } 
  if(! goog.array.contains(map[key], value)) { 
    map[key].push(value); 
  } 
}; 
goog.net.xhrMonitor = new goog.net.XhrMonitor_(); 

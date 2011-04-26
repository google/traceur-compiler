
goog.provide('goog.events.EventHandler'); 
goog.require('goog.Disposable'); 
goog.require('goog.events'); 
goog.require('goog.events.EventWrapper'); 
goog.require('goog.object'); 
goog.require('goog.structs.SimplePool'); 
goog.events.EventHandler = function(opt_handler) { 
  goog.Disposable.call(this); 
  this.handler_ = opt_handler; 
}; 
goog.inherits(goog.events.EventHandler, goog.Disposable); 
goog.events.EventHandler.KEY_POOL_INITIAL_COUNT = 0; 
goog.events.EventHandler.KEY_POOL_MAX_COUNT = 100; 
goog.events.EventHandler.keyPool_ = new goog.structs.SimplePool(goog.events.EventHandler.KEY_POOL_INITIAL_COUNT, goog.events.EventHandler.KEY_POOL_MAX_COUNT); 
goog.events.EventHandler.keys_ = null; 
goog.events.EventHandler.key_ = null; 
goog.events.EventHandler.typeArray_ =[]; 
goog.events.EventHandler.prototype.listen = function(src, type, opt_fn, opt_capture, opt_handler) { 
  if(! goog.isArray(type)) { 
    goog.events.EventHandler.typeArray_[0]=(type); 
    type = goog.events.EventHandler.typeArray_; 
  } 
  for(var i = 0; i < type.length; i ++) { 
    var key =(goog.events.listen(src, type[i], opt_fn || this, opt_capture || false, opt_handler || this.handler_ || this)); 
    this.recordListenerKey_(key); 
  } 
  return this; 
}; 
goog.events.EventHandler.prototype.listenOnce = function(src, type, opt_fn, opt_capture, opt_handler) { 
  if(goog.isArray(type)) { 
    for(var i = 0; i < type.length; i ++) { 
      this.listenOnce(src, type[i], opt_fn, opt_capture, opt_handler); 
    } 
  } else { 
    var key =(goog.events.listenOnce(src, type, opt_fn || this, opt_capture || false, opt_handler || this.handler_ || this)); 
    this.recordListenerKey_(key); 
  } 
  return this; 
}; 
goog.events.EventHandler.prototype.listenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) { 
  wrapper.listen(src, listener, opt_capt, opt_handler || this.handler_, this); 
  return this; 
}; 
goog.events.EventHandler.prototype.recordListenerKey_ = function(key) { 
  if(this.keys_) { 
    this.keys_[key]= true; 
  } else if(this.key_) { 
    this.keys_ = goog.events.EventHandler.keyPool_.getObject(); 
    this.keys_[this.key_]= true; 
    this.key_ = null; 
    this.keys_[key]= true; 
  } else { 
    this.key_ = key; 
  } 
}; 
goog.events.EventHandler.prototype.unlisten = function(src, type, opt_fn, opt_capture, opt_handler) { 
  if(this.key_ || this.keys_) { 
    if(goog.isArray(type)) { 
      for(var i = 0; i < type.length; i ++) { 
        this.unlisten(src, type[i], opt_fn, opt_capture, opt_handler); 
      } 
    } else { 
      var listener = goog.events.getListener(src, type, opt_fn || this, opt_capture || false, opt_handler || this.handler_ || this); 
      if(listener) { 
        var key = listener.key; 
        goog.events.unlistenByKey(key); 
        if(this.keys_) { 
          goog.object.remove(this.keys_, key); 
        } else if(this.key_ == key) { 
          this.key_ = null; 
        } 
      } 
    } 
  } 
  return this; 
}; 
goog.events.EventHandler.prototype.unlistenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) { 
  wrapper.unlisten(src, listener, opt_capt, opt_handler || this.handler_, this); 
  return this; 
}; 
goog.events.EventHandler.prototype.removeAll = function() { 
  if(this.keys_) { 
    for(var key in this.keys_) { 
      goog.events.unlistenByKey((key)); 
      delete this.keys_[key]; 
    } 
    goog.events.EventHandler.keyPool_.releaseObject(this.keys_); 
    this.keys_ = null; 
  } else if(this.key_) { 
    goog.events.unlistenByKey(this.key_); 
  } 
}; 
goog.events.EventHandler.prototype.disposeInternal = function() { 
  goog.events.EventHandler.superClass_.disposeInternal.call(this); 
  this.removeAll(); 
}; 
goog.events.EventHandler.prototype.handleEvent = function(e) { 
  throw Error('EventHandler.handleEvent not implemented'); 
}; 

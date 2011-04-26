
goog.provide('goog.events.Listener'); 
goog.events.Listener = function() { }; 
goog.events.Listener.counter_ = 0; 
goog.events.Listener.prototype.isFunctionListener_; 
goog.events.Listener.prototype.listener; 
goog.events.Listener.prototype.proxy; 
goog.events.Listener.prototype.src; 
goog.events.Listener.prototype.type; 
goog.events.Listener.prototype.capture; 
goog.events.Listener.prototype.handler; 
goog.events.Listener.prototype.key = 0; 
goog.events.Listener.prototype.removed = false; 
goog.events.Listener.prototype.callOnce = false; 
goog.events.Listener.prototype.init = function(listener, proxy, src, type, capture, opt_handler) { 
  if(goog.isFunction(listener)) { 
    this.isFunctionListener_ = true; 
  } else if(listener && listener.handleEvent && goog.isFunction(listener.handleEvent)) { 
    this.isFunctionListener_ = false; 
  } else { 
    throw Error('Invalid listener argument'); 
  } 
  this.listener = listener; 
  this.proxy = proxy; 
  this.src = src; 
  this.type = type; 
  this.capture = ! ! capture; 
  this.handler = opt_handler; 
  this.callOnce = false; 
  this.key = ++ goog.events.Listener.counter_; 
  this.removed = false; 
}; 
goog.events.Listener.prototype.handleEvent = function(eventObject) { 
  if(this.isFunctionListener_) { 
    return this.listener.call(this.handler || this.src, eventObject); 
  } 
  return this.listener.handleEvent.call(this.listener, eventObject); 
}; 

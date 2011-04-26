
goog.provide('goog.events.OnlineHandler'); 
goog.provide('goog.events.OnlineHandler.EventType'); 
goog.require('goog.Timer'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.userAgent'); 
goog.events.OnlineHandler = function() { 
  goog.events.EventTarget.call(this); 
  this.eventHandler_ = new goog.events.EventHandler(this); 
  if(! goog.userAgent.WEBKIT || goog.userAgent.WEBKIT && goog.userAgent.isVersion('528')) { 
    if(goog.events.OnlineHandler.supportsHtml5Events_()) { 
      this.eventHandler_.listen(document.body,['online', 'offline'], this.handleChange_); 
    } else { 
      this.online_ = this.isOnline(); 
      this.timer_ = new goog.Timer(goog.events.OnlineHandler.POLL_INTERVAL_); 
      this.eventHandler_.listen(this.timer_, goog.Timer.TICK, this.handleTick_); 
      this.timer_.start(); 
    } 
  } 
}; 
goog.inherits(goog.events.OnlineHandler, goog.events.EventTarget); 
goog.events.OnlineHandler.EventType = { 
  ONLINE: 'online', 
  OFFLINE: 'offline' 
}; 
goog.events.OnlineHandler.POLL_INTERVAL_ = 250; 
goog.events.OnlineHandler.supportsHtml5Events_ = function() { 
  return goog.userAgent.GECKO && goog.userAgent.isVersion('1.9b') || goog.userAgent.IE && goog.userAgent.isVersion('8') || goog.userAgent.OPERA && goog.userAgent.isVersion('9.5') || goog.userAgent.WEBKIT && goog.userAgent.isVersion('528'); 
}; 
goog.events.OnlineHandler.prototype.online_; 
goog.events.OnlineHandler.prototype.timer_; 
goog.events.OnlineHandler.prototype.eventHandler_; 
goog.events.OnlineHandler.prototype.isOnline = function() { 
  return 'onLine' in navigator ? navigator.onLine: true; 
}; 
goog.events.OnlineHandler.prototype.handleTick_ = function(e) { 
  var online = this.isOnline(); 
  if(online != this.online_) { 
    this.online_ = online; 
    this.handleChange_(e); 
  } 
}; 
goog.events.OnlineHandler.prototype.handleChange_ = function(e) { 
  var type = this.isOnline() ? goog.events.OnlineHandler.EventType.ONLINE: goog.events.OnlineHandler.EventType.OFFLINE; 
  this.dispatchEvent(type); 
}; 
goog.events.OnlineHandler.prototype.disposeInternal = function() { 
  goog.events.OnlineHandler.superClass_.disposeInternal.call(this); 
  this.eventHandler_.dispose(); 
  delete this.eventHandler_; 
  if(this.timer_) { 
    this.timer_.dispose(); 
    delete this.timer_; 
  } 
}; 

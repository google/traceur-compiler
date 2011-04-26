
goog.provide('goog.net.ImageLoader'); 
goog.require('goog.dom'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.net.EventType'); 
goog.require('goog.object'); 
goog.require('goog.userAgent'); 
goog.net.ImageLoader = function(opt_parent) { 
  goog.events.EventTarget.call(this); 
  this.images_ = { }; 
  this.handler_ = new goog.events.EventHandler(this); 
  this.parent_ = opt_parent; 
}; 
goog.inherits(goog.net.ImageLoader, goog.events.EventTarget); 
goog.net.ImageLoader.prototype.images_; 
goog.net.ImageLoader.prototype.handler_; 
goog.net.ImageLoader.prototype.parent_; 
goog.net.ImageLoader.prototype.addImage = function(id, image) { 
  var src = goog.isString(image) ? image: image.src; 
  if(src) { 
    this.images_[id]= src; 
  } 
}; 
goog.net.ImageLoader.prototype.removeImage = function(id) { 
  goog.object.remove(this.images_, id); 
}; 
goog.net.ImageLoader.prototype.start = function() { 
  goog.object.forEach(this.images_, this.loadImage_, this); 
}; 
goog.net.ImageLoader.prototype.loadImage_ = function(src, id) { 
  var image; 
  if(this.parent_) { 
    var dom = goog.dom.getDomHelper(this.parent_); 
    image = dom.createDom('img'); 
  } else { 
    image = new Image(); 
  } 
  var loadEvent = goog.userAgent.IE ? goog.net.EventType.READY_STATE_CHANGE: goog.events.EventType.LOAD; 
  this.handler_.listen(image,[loadEvent, goog.net.EventType.ABORT, goog.net.EventType.ERROR], this.onNetworkEvent_); 
  image.id = id; 
  image.src = src; 
}; 
goog.net.ImageLoader.prototype.onNetworkEvent_ = function(evt) { 
  var image = evt.currentTarget; 
  if(! image) { 
    return; 
  } 
  if(evt.type == goog.net.EventType.READY_STATE_CHANGE) { 
    if(image.readyState == goog.net.EventType.COMPLETE) { 
      evt.type = goog.events.EventType.LOAD; 
    } else { 
      return; 
    } 
  } 
  if(typeof image.naturalWidth == 'undefined') { 
    if(evt.type == goog.events.EventType.LOAD) { 
      image.naturalWidth = image.width; 
      image.naturalHeight = image.height; 
    } else { 
      image.naturalWidth = 0; 
      image.naturalHeight = 0; 
    } 
  } 
  this.dispatchEvent({ 
    type: evt.type, 
    target: image 
  }); 
  if(this.isDisposed()) { 
    return; 
  } 
  goog.object.remove(this.images_, image.id); 
  if(goog.object.isEmpty(this.images_)) { 
    this.dispatchEvent(goog.net.EventType.COMPLETE); 
    if(this.handler_) { 
      this.handler_.removeAll(); 
    } 
  } 
}; 
goog.net.ImageLoader.prototype.disposeInternal = function() { 
  if(this.images_) { 
    delete this.images_; 
  } 
  if(this.handler_) { 
    this.handler_.dispose(); 
    this.handler_ = null; 
  } 
  goog.net.ImageLoader.superClass_.disposeInternal.call(this); 
}; 


goog.provide('goog.history.Html5History'); 
goog.provide('goog.history.Html5History.TokenTransformer'); 
goog.require('goog.asserts'); 
goog.require('goog.events'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.history.Event'); 
goog.require('goog.history.EventType'); 
goog.history.Html5History = function(opt_win, opt_transformer) { 
  goog.events.EventTarget.call(this); 
  goog.asserts.assert(goog.history.Html5History.isSupported(opt_win), 'HTML5 history is not supported.'); 
  this.window_ = opt_win || window; 
  this.transformer_ = opt_transformer || null; 
  goog.events.listen(this.window_, goog.events.EventType.POPSTATE, this.onHistoryEvent_, false, this); 
  goog.events.listen(this.window_, goog.events.EventType.HASHCHANGE, this.onHistoryEvent_, false, this); 
}; 
goog.inherits(goog.history.Html5History, goog.events.EventTarget); 
goog.history.Html5History.isSupported = function(opt_win) { 
  var win = opt_win || window; 
  return ! !(win.history && win.history.pushState); 
}; 
goog.history.Html5History.prototype.enabled_ = false; 
goog.history.Html5History.prototype.useFragment_ = true; 
goog.history.Html5History.prototype.pathPrefix_ = '/'; 
goog.history.Html5History.prototype.setEnabled = function(enable) { 
  if(enable == this.enabled_) { 
    return; 
  } 
  this.enabled_ = enable; 
  if(enable) { 
    this.dispatchEvent(new goog.history.Event(this.getToken(), false)); 
  } 
}; 
goog.history.Html5History.prototype.getToken = function() { 
  if(this.useFragment_) { 
    var loc = this.window_.location.href; 
    var index = loc.indexOf('#'); 
    return index < 0 ? '': loc.substring(index + 1); 
  } else { 
    return this.transformer_ ? this.transformer_.retrieveToken(this.pathPrefix_, this.window_.location): this.window_.location.pathname.substr(this.pathPrefix_.length); 
  } 
}; 
goog.history.Html5History.prototype.setToken = function(token, opt_title) { 
  if(token == this.getToken()) { 
    return; 
  } 
  this.window_.history.pushState(null, opt_title || this.window_.document.title || '', this.getUrl_(token)); 
  this.dispatchEvent(new goog.history.Event(token, false)); 
}; 
goog.history.Html5History.prototype.replaceToken = function(token, opt_title) { 
  this.window_.history.replaceState(null, opt_title || this.window_.document.title || '', this.getUrl_(token)); 
  this.dispatchEvent(new goog.history.Event(token, false)); 
}; 
goog.history.Html5History.prototype.disposeInternal = function() { 
  goog.events.unlisten(this.window_, goog.events.EventType.POPSTATE, this.onHistoryEvent_, false, this); 
  if(this.useFragment_) { 
    goog.events.unlisten(this.window_, goog.events.EventType.HASHCHANGE, this.onHistoryEvent_, false, this); 
  } 
}; 
goog.history.Html5History.prototype.setUseFragment = function(useFragment) { 
  if(this.useFragment_ != useFragment) { 
    if(useFragment) { 
      goog.events.listen(this.window_, goog.events.EventType.HASHCHANGE, this.onHistoryEvent_, false, this); 
    } else { 
      goog.events.unlisten(this.window_, goog.events.EventType.HASHCHANGE, this.onHistoryEvent_, false, this); 
    } 
    this.useFragment_ = useFragment; 
  } 
}; 
goog.history.Html5History.prototype.setPathPrefix = function(pathPrefix) { 
  this.pathPrefix_ = pathPrefix; 
}; 
goog.history.Html5History.prototype.getPathPrefix = function() { 
  return this.pathPrefix_; 
}; 
goog.history.Html5History.prototype.getUrl_ = function(token) { 
  if(this.useFragment_) { 
    return '#' + token; 
  } else { 
    return this.transformer_ ? this.transformer_.createUrl(token, this.pathPrefix_, this.window_.location): this.pathPrefix_ + token + this.window_.location.search; 
  } 
}; 
goog.history.Html5History.prototype.onHistoryEvent_ = function(e) { 
  if(this.enabled_) { 
    this.dispatchEvent(new goog.history.Event(this.getToken(), true)); 
  } 
}; 
goog.history.Html5History.TokenTransformer = function() { }; 
goog.history.Html5History.TokenTransformer.prototype.retrieveToken = function(pathPrefix, location) { }; 
goog.history.Html5History.TokenTransformer.prototype.createUrl = function(token, pathPrefix, location) { }; 

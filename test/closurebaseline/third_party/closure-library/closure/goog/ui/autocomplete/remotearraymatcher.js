
goog.provide('goog.ui.AutoComplete.RemoteArrayMatcher'); 
goog.require('goog.Disposable'); 
goog.require('goog.Uri'); 
goog.require('goog.events'); 
goog.require('goog.json'); 
goog.require('goog.net.XhrIo'); 
goog.require('goog.ui.AutoComplete'); 
goog.ui.AutoComplete.RemoteArrayMatcher = function(url, opt_noSimilar) { 
  goog.Disposable.call(this); 
  this.url_ = url; 
  this.useSimilar_ = ! opt_noSimilar; 
  this.xhr_ = new goog.net.XhrIo(); 
}; 
goog.inherits(goog.ui.AutoComplete.RemoteArrayMatcher, goog.Disposable); 
goog.ui.AutoComplete.RemoteArrayMatcher.prototype.method_ = 'GET'; 
goog.ui.AutoComplete.RemoteArrayMatcher.prototype.content_ = undefined; 
goog.ui.AutoComplete.RemoteArrayMatcher.prototype.headers_ = null; 
goog.ui.AutoComplete.RemoteArrayMatcher.prototype.lastListenerKey_ = null; 
goog.ui.AutoComplete.RemoteArrayMatcher.prototype.setMethod = function(method) { 
  this.method_ = method; 
}; 
goog.ui.AutoComplete.RemoteArrayMatcher.prototype.setContent = function(content) { 
  this.content_ = content; 
}; 
goog.ui.AutoComplete.RemoteArrayMatcher.prototype.setHeaders = function(headers) { 
  this.headers_ = headers; 
}; 
goog.ui.AutoComplete.RemoteArrayMatcher.prototype.setTimeoutInterval = function(interval) { 
  this.xhr_.setTimeoutInterval(interval); 
}; 
goog.ui.AutoComplete.RemoteArrayMatcher.prototype.buildUrl = function(uri, token, maxMatches, useSimilar, opt_fullString) { 
  var url = new goog.Uri(uri); 
  url.setParameterValue('token', token); 
  url.setParameterValue('max_matches', String(maxMatches)); 
  url.setParameterValue('use_similar', String(Number(useSimilar))); 
  return url.toString(); 
}; 
goog.ui.AutoComplete.RemoteArrayMatcher.prototype.shouldRequestMatches = function(uri, token, maxMatches, useSimilar, opt_fullString) { 
  return true; 
}; 
goog.ui.AutoComplete.RemoteArrayMatcher.prototype.parseResponseText = function(responseText) { 
  var matches =[]; 
  if(responseText) { 
    try { 
      matches = goog.json.unsafeParse(responseText); 
    } catch(exception) { } 
  } 
  return(matches); 
}; 
goog.ui.AutoComplete.RemoteArrayMatcher.prototype.xhrCallback = function(token, matchHandler, event) { 
  var text = event.target.getResponseText(); 
  matchHandler(token, this.parseResponseText(text)); 
}; 
goog.ui.AutoComplete.RemoteArrayMatcher.prototype.requestMatchingRows = function(token, maxMatches, matchHandler, opt_fullString) { 
  if(! this.shouldRequestMatches(this.url_, token, maxMatches, this.useSimilar_, opt_fullString)) { 
    return; 
  } 
  var url = this.buildUrl(this.url_, token, maxMatches, this.useSimilar_, opt_fullString); 
  if(! url) { 
    return; 
  } 
  var callback = goog.bind(this.xhrCallback, this, token, matchHandler); 
  if(this.xhr_.isActive()) { 
    this.xhr_.abort(); 
  } 
  if(this.lastListenerKey_) { 
    goog.events.unlistenByKey(this.lastListenerKey_); 
  } 
  this.lastListenerKey_ = goog.events.listenOnce(this.xhr_, goog.net.EventType.SUCCESS, callback); 
  this.xhr_.send(url, this.method_, this.content_, this.headers_); 
}; 
goog.ui.AutoComplete.RemoteArrayMatcher.prototype.disposeInternal = function() { 
  this.xhr_.dispose(); 
  goog.ui.AutoComplete.RemoteArrayMatcher.superClass_.disposeInternal.call(this); 
}; 

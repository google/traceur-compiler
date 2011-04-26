
goog.provide('goog.net.BulkLoader'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.net.BulkLoaderHelper'); 
goog.require('goog.net.EventType'); 
goog.require('goog.net.XhrIo'); 
goog.net.BulkLoader = function(uris) { 
  goog.events.EventTarget.call(this); 
  this.helper_ = new goog.net.BulkLoaderHelper(uris); 
  this.eventHandler_ = new goog.events.EventHandler(this); 
}; 
goog.inherits(goog.net.BulkLoader, goog.events.EventTarget); 
goog.net.BulkLoader.prototype.logger_ = goog.debug.Logger.getLogger('goog.net.BulkLoader'); 
goog.net.BulkLoader.prototype.getResponseTexts = function() { 
  return this.helper_.getResponseTexts(); 
}; 
goog.net.BulkLoader.prototype.load = function() { 
  var eventHandler = this.eventHandler_; 
  var uris = this.helper_.getUris(); 
  this.logger_.info('Starting load of code with ' + uris.length + ' uris.'); 
  for(var i = 0; i < uris.length; i ++) { 
    var xhrIo = new goog.net.XhrIo(); 
    eventHandler.listen(xhrIo, goog.net.EventType.COMPLETE, goog.bind(this.handleEvent_, this, i)); 
    xhrIo.send(uris[i]); 
  } 
}; 
goog.net.BulkLoader.prototype.handleEvent_ = function(id, e) { 
  this.logger_.info('Received event "' + e.type + '" for id ' + id + ' with uri ' + this.helper_.getUri(id)); 
  var xhrIo =(e.target); 
  if(xhrIo.isSuccess()) { 
    this.handleSuccess_(id, xhrIo); 
  } else { 
    this.handleError_(id, xhrIo); 
  } 
}; 
goog.net.BulkLoader.prototype.handleSuccess_ = function(id, xhrIo) { 
  this.helper_.setResponseText(id, xhrIo.getResponseText()); 
  if(this.helper_.isLoadComplete()) { 
    this.finishLoad_(); 
  } 
  xhrIo.dispose(); 
}; 
goog.net.BulkLoader.prototype.handleError_ = function(id, xhrIo) { 
  this.dispatchEvent(goog.net.EventType.ERROR); 
  xhrIo.dispose(); 
}; 
goog.net.BulkLoader.prototype.finishLoad_ = function() { 
  this.logger_.info('All uris loaded.'); 
  this.dispatchEvent(goog.net.EventType.SUCCESS); 
}; 
goog.net.BulkLoader.prototype.disposeInternal = function() { 
  goog.net.BulkLoader.superClass_.disposeInternal.call(this); 
  this.eventHandler_.dispose(); 
  this.eventHandler_ = null; 
  this.helper_.dispose(); 
  this.helper_ = null; 
}; 

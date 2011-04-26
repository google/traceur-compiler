
goog.provide('goog.gears.UrlCapture'); 
goog.provide('goog.gears.UrlCapture.Event'); 
goog.provide('goog.gears.UrlCapture.EventType'); 
goog.require('goog.Uri'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.gears'); 
goog.gears.UrlCapture = function(name, requiredCookie, opt_localServer) { 
  goog.events.EventTarget.call(this); 
  this.storeName_ = goog.gears.makeSafeFileName(name); 
  if(name != this.storeName_) { 
    this.logger_.info('local store name ' + name + '->' + this.storeName_); 
  } 
  this.requiredCookie_ = requiredCookie ? String(requiredCookie): null; 
  this.localServer_ = opt_localServer || goog.gears.getFactory().create('beta.localserver', '1.0'); 
  this.uris_ = { }; 
  this.errorUris_ = { }; 
  this.numCompleted_ = { }; 
}; 
goog.inherits(goog.gears.UrlCapture, goog.events.EventTarget); 
goog.gears.UrlCapture.prototype.logger_ = goog.debug.Logger.getLogger('goog.gears.UrlCapture'); 
goog.gears.UrlCapture.prototype.resourceStore_ = null; 
goog.gears.UrlCapture.EventType = { 
  URL_SUCCESS: 'url_success', 
  URL_ERROR: 'url_error', 
  COMPLETE: 'complete', 
  ABORT: 'abort' 
}; 
goog.gears.UrlCapture.prototype.getResourceStore_ = function() { 
  if(! this.resourceStore_) { 
    this.logger_.info('creating resource store: ' + this.storeName_); 
    this.resourceStore_ = this.localServer_['createStore'](this.storeName_, this.requiredCookie_); 
  } 
  return this.resourceStore_; 
}; 
goog.gears.UrlCapture.prototype.exists = function() { 
  if(! this.resourceStore_) { 
    this.logger_.info('opening resource store: ' + this.storeName_); 
    this.resourceStore_ = this.localServer_['openStore'](this.storeName_, this.requiredCookie_); 
  } 
  return ! ! this.resourceStore_; 
}; 
goog.gears.UrlCapture.prototype.removeStore = function() { 
  this.logger_.info('removing resource store: ' + this.storeName_); 
  this.localServer_['removeStore'](this.storeName_, this.requiredCookie_); 
  this.resourceStore_ = null; 
}; 
goog.gears.UrlCapture.prototype.rename = function(srcUri, dstUri) { 
  this.getResourceStore_()['rename'](srcUri.toString(), dstUri.toString()); 
}; 
goog.gears.UrlCapture.prototype.copy = function(srcUri, dstUri) { 
  this.getResourceStore_()['copy'](srcUri.toString(), dstUri.toString()); 
}; 
goog.gears.UrlCapture.prototype.capture = function(uris) { 
  var count = uris.length; 
  this.logger_.fine('capture: count==' + count); 
  if(! count) { 
    throw Error('No URIs to capture'); 
  } 
  var captureStrings =[]; 
  for(var i = 0; i < count; i ++) { 
    captureStrings.push(uris[i].toString()); 
  } 
  var id = this.getResourceStore_()['capture'](captureStrings, goog.bind(this.captureCallback_, this)); 
  this.logger_.fine('capture started: ' + id); 
  this.uris_[id]= uris; 
  this.errorUris_[id]=[]; 
  this.numCompleted_[id]= 0; 
  return id; 
}; 
goog.gears.UrlCapture.prototype.abort = function(captureId) { 
  this.logger_.fine('abort: ' + captureId); 
  if(typeof captureId != 'number') { 
    throw Error('bad capture ID: ' + captureId); 
  } 
  if(this.uris_[captureId]|| this.numCompleted_[captureId]) { 
    this.logger_.info('aborting capture: ' + captureId); 
    this.getResourceStore_()['abortCapture'](captureId); 
    this.cleanupCapture_(captureId); 
    this.dispatchEvent(new goog.gears.UrlCapture.Event(goog.gears.UrlCapture.EventType.ABORT, captureId)); 
  } 
}; 
goog.gears.UrlCapture.prototype.isCaptured = function(uri) { 
  this.logger_.fine('isCaptured: ' + uri); 
  return this.getResourceStore_()['isCaptured'](uri.toString()); 
}; 
goog.gears.UrlCapture.prototype.remove = function(uri) { 
  this.logger_.fine('remove: ' + uri); 
  this.getResourceStore_()['remove'](uri.toString()); 
}; 
goog.gears.UrlCapture.prototype.captureCallback_ = function(url, success, captureId) { 
  this.logger_.fine('captureCallback_: ' + captureId); 
  if(! this.uris_[captureId]&& ! this.numCompleted_[captureId]) { 
    this.cleanupCapture_(captureId); 
    return; 
  } 
  var eventUri = this.usesGoogUri_(captureId) ? new goog.Uri(url): url; 
  var eventType = null; 
  if(success) { 
    eventType = goog.gears.UrlCapture.EventType.URL_SUCCESS; 
  } else { 
    eventType = goog.gears.UrlCapture.EventType.URL_ERROR; 
    this.errorUris_[captureId].push(eventUri); 
  } 
  this.dispatchEvent(new goog.gears.UrlCapture.Event(eventType, captureId, eventUri)); 
  this.numCompleted_[captureId]++; 
  if(this.numCompleted_[captureId]== this.uris_[captureId].length) { 
    this.dispatchEvent(new goog.gears.UrlCapture.Event(goog.gears.UrlCapture.EventType.COMPLETE, captureId, null, this.errorUris_[captureId])); 
    this.cleanupCapture_(captureId); 
  } 
}; 
goog.gears.UrlCapture.prototype.cleanupCapture_ = function(captureId) { 
  this.logger_.fine('cleanupCapture_: ' + captureId); 
  delete this.uris_[captureId]; 
  delete this.numCompleted_[captureId]; 
  delete this.errorUris_[captureId]; 
}; 
goog.gears.UrlCapture.prototype.usesGoogUri_ = function(captureId) { 
  if(this.uris_[captureId]&& this.uris_[captureId].length > 0 && this.uris_[captureId][0]instanceof goog.Uri) { 
    return true; 
  } 
  return false; 
}; 
goog.gears.UrlCapture.Event = function(type, captureId, opt_uri, opt_errorUris) { 
  goog.events.Event.call(this, type); 
  this.captureId = captureId; 
  this.uri = opt_uri || null; 
  this.errorUris = opt_errorUris ||[]; 
}; 
goog.inherits(goog.gears.UrlCapture.Event, goog.events.Event); 

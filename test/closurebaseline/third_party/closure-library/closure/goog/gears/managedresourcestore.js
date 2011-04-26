
goog.provide('goog.gears.ManagedResourceStore'); 
goog.provide('goog.gears.ManagedResourceStore.EventType'); 
goog.provide('goog.gears.ManagedResourceStore.UpdateStatus'); 
goog.provide('goog.gears.ManagedResourceStoreEvent'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.gears'); 
goog.require('goog.string'); 
goog.gears.ManagedResourceStore = function(name, requiredCookie, opt_localServer) { 
  this.localServer_ = opt_localServer || goog.gears.getFactory().create('beta.localserver', '1.0'); 
  this.name_ = goog.gears.makeSafeFileName(name); 
  if(name != this.name_) { 
    this.logger_.info('managed resource store name ' + name + '->' + this.name_); 
  } 
  this.requiredCookie_ = requiredCookie ? String(requiredCookie): null; 
  this.supportsEvents_ = goog.string.compareVersions(goog.gears.getFactory().version, '0.3.6') >= 0; 
}; 
goog.inherits(goog.gears.ManagedResourceStore, goog.events.EventTarget); 
goog.gears.ManagedResourceStore.UPDATE_INTERVAL_MS = 500; 
goog.gears.ManagedResourceStore.UpdateStatus = { 
  OK: 0, 
  CHECKING: 1, 
  DOWNLOADING: 2, 
  FAILURE: 3 
}; 
goog.gears.ManagedResourceStore.prototype.logger_ = goog.debug.Logger.getLogger('goog.gears.ManagedResourceStore'); 
goog.gears.ManagedResourceStore.prototype.localServer_; 
goog.gears.ManagedResourceStore.prototype.name_; 
goog.gears.ManagedResourceStore.prototype.requiredCookie_; 
goog.gears.ManagedResourceStore.prototype.supportsEvents_; 
goog.gears.ManagedResourceStore.prototype.gearsStore_; 
goog.gears.ManagedResourceStore.prototype.timerId_ = null; 
goog.gears.ManagedResourceStore.prototype.timer_ = null; 
goog.gears.ManagedResourceStore.prototype.active_ = false; 
goog.gears.ManagedResourceStore.prototype.filesComplete_ = 0; 
goog.gears.ManagedResourceStore.prototype.filesTotal_ = 0; 
goog.gears.ManagedResourceStore.prototype.isActive = function() { 
  return this.active_; 
}; 
goog.gears.ManagedResourceStore.prototype.isComplete = function() { 
  return this.filesComplete_ == this.filesTotal_; 
}; 
goog.gears.ManagedResourceStore.prototype.isSuccess = function() { 
  return this.getStatus() == goog.gears.ManagedResourceStore.UpdateStatus.OK; 
}; 
goog.gears.ManagedResourceStore.prototype.getFilesTotal = function() { 
  return this.filesTotal_; 
}; 
goog.gears.ManagedResourceStore.prototype.getLastError = function() { 
  return this.gearsStore_ ? this.gearsStore_.lastErrorMessage: ''; 
}; 
goog.gears.ManagedResourceStore.prototype.getFilesComplete = function() { 
  return this.filesComplete_; 
}; 
goog.gears.ManagedResourceStore.prototype.setFilesCounts_ = function(complete, total) { 
  if(this.filesComplete_ != complete || this.filesTotal_ != total) { 
    this.filesComplete_ = complete; 
    this.filesTotal_ = total; 
    this.dispatchEvent(goog.gears.ManagedResourceStore.EventType.PROGRESS); 
  } 
}; 
goog.gears.ManagedResourceStore.prototype.exists = function() { 
  if(! this.gearsStore_) { 
    this.gearsStore_ = this.localServer_.openManagedStore(this.name_, this.requiredCookie_); 
  } 
  return ! ! this.gearsStore_; 
}; 
goog.gears.ManagedResourceStore.prototype.assertExists_ = function() { 
  if(! this.exists()) { 
    throw Error('Store not yet created'); 
  } 
}; 
goog.gears.ManagedResourceStore.prototype.assertNotExists_ = function() { 
  if(this.exists()) { 
    throw Error('Store already created'); 
  } 
}; 
goog.gears.ManagedResourceStore.prototype.create = function(opt_manifestUrl) { 
  if(! this.exists()) { 
    this.gearsStore_ = this.localServer_.createManagedStore(this.name_, this.requiredCookie_); 
    this.assertExists_(); 
  } 
  if(opt_manifestUrl) { 
    this.gearsStore_.manifestUrl = String(opt_manifestUrl); 
  } 
}; 
goog.gears.ManagedResourceStore.prototype.update = function() { 
  if(this.active_) { 
    return; 
  } 
  this.assertExists_(); 
  if(this.supportsEvents_) { 
    this.gearsStore_.onprogress = goog.bind(this.handleProgress_, this); 
    this.gearsStore_.oncomplete = goog.bind(this.handleComplete_, this); 
    this.gearsStore_.onerror = goog.bind(this.handleError_, this); 
  } else { 
    this.timer_ = goog.gears.getFactory().create('beta.timer', '1.0'); 
    this.timerId_ = this.timer_.setInterval(goog.bind(this.checkUpdateStatus_, this), goog.gears.ManagedResourceStore.UPDATE_INTERVAL_MS); 
    this.setFilesCounts_(0, 1); 
  } 
  this.gearsStore_.checkForUpdate(); 
  this.active_ = true; 
}; 
goog.gears.ManagedResourceStore.prototype.getManifestUrl = function() { 
  this.assertExists_(); 
  return this.gearsStore_.manifestUrl; 
}; 
goog.gears.ManagedResourceStore.prototype.setManifestUrl = function(url) { 
  this.assertExists_(); 
  this.gearsStore_.manifestUrl = String(url); 
}; 
goog.gears.ManagedResourceStore.prototype.getVersion = function() { 
  return this.exists() ? this.gearsStore_.currentVersion: null; 
}; 
goog.gears.ManagedResourceStore.prototype.getStatus = function() { 
  this.assertExists_(); 
  return(this.gearsStore_.updateStatus); 
}; 
goog.gears.ManagedResourceStore.prototype.isEnabled = function() { 
  this.assertExists_(); 
  return this.gearsStore_.enabled; 
}; 
goog.gears.ManagedResourceStore.prototype.setEnabled = function(isEnabled) { 
  this.assertExists_(); 
  this.gearsStore_.enabled = ! ! isEnabled; 
}; 
goog.gears.ManagedResourceStore.prototype.remove = function() { 
  this.assertExists_(); 
  this.localServer_.removeManagedStore(this.name_, this.requiredCookie_); 
  this.gearsStore_ = null; 
  this.assertNotExists_(); 
}; 
goog.gears.ManagedResourceStore.prototype.checkUpdateStatus_ = function() { 
  var e; 
  if(this.gearsStore_.updateStatus == goog.gears.ManagedResourceStore.UpdateStatus.FAILURE) { 
    e = new goog.gears.ManagedResourceStoreEvent(goog.gears.ManagedResourceStore.EventType.ERROR, this.gearsStore_.lastErrorMessage); 
    this.setFilesCounts_(0, 1); 
  } else if(this.gearsStore_.updateStatus == goog.gears.ManagedResourceStore.UpdateStatus.OK) { 
    e = new goog.gears.ManagedResourceStoreEvent(goog.gears.ManagedResourceStore.EventType.SUCCESS); 
    this.setFilesCounts_(1, 1); 
  } 
  if(e) { 
    this.cancelStatusCheck_(); 
    this.dispatchEvent(e); 
    this.dispatchEvent(goog.gears.ManagedResourceStore.EventType.COMPLETE); 
    this.active_ = false; 
  } 
}; 
goog.gears.ManagedResourceStore.prototype.cancelStatusCheck_ = function() { 
  if(! this.supportsEvents_ && this.timerId_ != null) { 
    this.timer_.clearInterval(this.timerId_); 
    this.timerId_ = null; 
    this.timer_ = null; 
  } 
}; 
goog.gears.ManagedResourceStore.prototype.handleProgress_ = function(details) { 
  this.setFilesCounts_(details['filesComplete'], details['filesTotal']); 
}; 
goog.gears.ManagedResourceStore.prototype.handleComplete_ = function(details) { 
  this.dispatchEvent(goog.gears.ManagedResourceStore.EventType.SUCCESS); 
  this.dispatchEvent(goog.gears.ManagedResourceStore.EventType.COMPLETE); 
  this.active_ = false; 
}; 
goog.gears.ManagedResourceStore.prototype.handleError_ = function(error) { 
  this.dispatchEvent(new goog.gears.ManagedResourceStoreEvent(goog.gears.ManagedResourceStore.EventType.ERROR, error.message)); 
  this.dispatchEvent(goog.gears.ManagedResourceStore.EventType.COMPLETE); 
  this.active_ = false; 
}; 
goog.gears.ManagedResourceStore.prototype.disposeInternal = function() { 
  goog.gears.ManagedResourceStore.superClass_.disposeInternal.call(this); 
  if(this.supportsEvents_ && this.gearsStore_) { 
    this.gearsStore_.onprogress = null; 
    this.gearsStore_.oncomplete = null; 
    this.gearsStore_.onerror = null; 
  } 
  this.cancelStatusCheck_(); 
  this.localServer_ = null; 
  this.gearsStore_ = null; 
}; 
goog.gears.ManagedResourceStore.EventType = { 
  COMPLETE: 'complete', 
  ERROR: 'error', 
  PROGRESS: 'progress', 
  SUCCESS: 'success' 
}; 
goog.gears.ManagedResourceStoreEvent = function(type, opt_errorMessage) { 
  goog.events.Event.call(this, type); 
  if(opt_errorMessage) { 
    this.errorMessage = opt_errorMessage; 
  } 
}; 
goog.inherits(goog.gears.ManagedResourceStoreEvent, goog.events.Event); 
goog.gears.ManagedResourceStoreEvent.prototype.errorMessage = null; 

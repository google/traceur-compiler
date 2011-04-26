
goog.provide('goog.ui.IdleTimer'); 
goog.require('goog.Timer'); 
goog.require('goog.events'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.structs.Set'); 
goog.require('goog.ui.ActivityMonitor'); 
goog.ui.IdleTimer = function(idleThreshold, opt_activityMonitor) { 
  goog.events.EventTarget.call(this); 
  var activityMonitor = opt_activityMonitor || this.getDefaultActivityMonitor_(); 
  this.idleThreshold_ = idleThreshold; 
  this.activityMonitor_ = activityMonitor; 
  this.boundOnActivityTick_ = goog.bind(this.onActivityTick_, this); 
  this.maybeStillActive_(); 
}; 
goog.inherits(goog.ui.IdleTimer, goog.events.EventTarget); 
goog.ui.IdleTimer.prototype.hasActivityListener_ = false; 
goog.ui.IdleTimer.prototype.onActivityTimerId_ = null; 
goog.ui.IdleTimer.prototype.isIdle_ = false; 
goog.ui.IdleTimer.defaultActivityMonitor_ = null; 
goog.ui.IdleTimer.defaultActivityMonitorReferences_ = new goog.structs.Set(); 
goog.ui.IdleTimer.Event = { 
  BECOME_ACTIVE: 'active', 
  BECOME_IDLE: 'idle' 
}; 
goog.ui.IdleTimer.prototype.getDefaultActivityMonitor_ = function() { 
  goog.ui.IdleTimer.defaultActivityMonitorReferences_.add(this); 
  if(goog.ui.IdleTimer.defaultActivityMonitor_ == null) { 
    goog.ui.IdleTimer.defaultActivityMonitor_ = new goog.ui.ActivityMonitor(); 
  } 
  return goog.ui.IdleTimer.defaultActivityMonitor_; 
}; 
goog.ui.IdleTimer.prototype.maybeDisposeDefaultActivityMonitor_ = function() { 
  goog.ui.IdleTimer.defaultActivityMonitorReferences_.remove(this); 
  if(goog.ui.IdleTimer.defaultActivityMonitor_ != null && goog.ui.IdleTimer.defaultActivityMonitorReferences_.isEmpty()) { 
    goog.ui.IdleTimer.defaultActivityMonitor_.dispose(); 
    goog.ui.IdleTimer.defaultActivityMonitor_ = null; 
  } 
}; 
goog.ui.IdleTimer.prototype.maybeStillActive_ = function() { 
  var remainingIdleThreshold = this.idleThreshold_ + 1 -(goog.now() - this.activityMonitor_.getLastEventTime()); 
  if(remainingIdleThreshold > 0) { 
    this.onActivityTimerId_ = goog.Timer.callOnce(this.boundOnActivityTick_, remainingIdleThreshold); 
  } else { 
    this.becomeIdle_(); 
  } 
}; 
goog.ui.IdleTimer.prototype.onActivityTick_ = function() { 
  this.onActivityTimerId_ = null; 
  this.maybeStillActive_(); 
}; 
goog.ui.IdleTimer.prototype.becomeIdle_ = function() { 
  this.isIdle_ = true; 
  goog.events.listen(this.activityMonitor_, goog.ui.ActivityMonitor.Event.ACTIVITY, this.onActivity_, false, this); 
  this.hasActivityListener_ = true; 
  this.dispatchEvent(goog.ui.IdleTimer.Event.BECOME_IDLE); 
}; 
goog.ui.IdleTimer.prototype.onActivity_ = function(e) { 
  this.becomeActive_(); 
}; 
goog.ui.IdleTimer.prototype.becomeActive_ = function() { 
  this.isIdle_ = false; 
  this.removeActivityListener_(); 
  this.dispatchEvent(goog.ui.IdleTimer.Event.BECOME_ACTIVE); 
  this.maybeStillActive_(); 
}; 
goog.ui.IdleTimer.prototype.removeActivityListener_ = function() { 
  if(this.hasActivityListener_) { 
    goog.events.unlisten(this.activityMonitor_, goog.ui.ActivityMonitor.Event.ACTIVITY, this.onActivity_, false, this); 
    this.hasActivityListener_ = false; 
  } 
}; 
goog.ui.IdleTimer.prototype.disposeInternal = function() { 
  this.removeActivityListener_(); 
  if(this.onActivityTimerId_ != null) { 
    goog.global.clearTimeout(this.onActivityTimerId_); 
    this.onActivityTimerId_ = null; 
  } 
  this.maybeDisposeDefaultActivityMonitor_(); 
  goog.ui.IdleTimer.superClass_.disposeInternal.call(this); 
}; 
goog.ui.IdleTimer.prototype.getIdleThreshold = function() { 
  return this.idleThreshold_; 
}; 
goog.ui.IdleTimer.prototype.getActivityMonitor = function() { 
  return this.activityMonitor_; 
}; 
goog.ui.IdleTimer.prototype.isIdle = function() { 
  return this.isIdle_; 
}; 

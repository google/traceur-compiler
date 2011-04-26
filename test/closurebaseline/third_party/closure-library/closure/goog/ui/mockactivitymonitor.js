
goog.provide('goog.ui.MockActivityMonitor'); 
goog.require('goog.events.EventType'); 
goog.require('goog.ui.ActivityMonitor'); 
goog.ui.MockActivityMonitor = function() { 
  goog.ui.ActivityMonitor.call(this); 
}; 
goog.inherits(goog.ui.MockActivityMonitor, goog.ui.ActivityMonitor); 
goog.ui.MockActivityMonitor.prototype.simulateEvent = function(opt_type) { 
  var type = opt_type || goog.events.EventType.MOUSEMOVE; 
  var eventTime = goog.now(); 
  this.lastEventTime_ = eventTime; 
  this.lastEventType_ = type; 
  this.dispatchEvent(goog.ui.ActivityMonitor.Event.ACTIVITY); 
}; 

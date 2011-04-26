
goog.provide('goog.ui.ActivityMonitor'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.ui.ActivityMonitor = function(opt_domHelper) { 
  goog.events.EventTarget.call(this); 
  this.documents_ =[]; 
  this.eventHandler_ = new goog.events.EventHandler(this); 
  if(! opt_domHelper) { 
    this.addDocument(goog.dom.getDomHelper().getDocument()); 
  } else if(goog.isArray(opt_domHelper)) { 
    for(var i = 0; i < opt_domHelper.length; i ++) { 
      this.addDocument(opt_domHelper[i].getDocument()); 
    } 
  } else { 
    this.addDocument(opt_domHelper.getDocument()); 
  } 
  this.lastEventTime_ = goog.now(); 
}; 
goog.inherits(goog.ui.ActivityMonitor, goog.events.EventTarget); 
goog.ui.ActivityMonitor.prototype.lastEventType_ = ''; 
goog.ui.ActivityMonitor.prototype.lastMouseX_; 
goog.ui.ActivityMonitor.prototype.lastMouseY_; 
goog.ui.ActivityMonitor.prototype.minEventTime_ = 0; 
goog.ui.ActivityMonitor.MIN_EVENT_SPACING = 3 * 1000; 
goog.ui.ActivityMonitor.userEventTypesBody_ =[goog.events.EventType.CLICK, goog.events.EventType.DBLCLICK, goog.events.EventType.MOUSEDOWN, goog.events.EventType.MOUSEUP, goog.events.EventType.MOUSEMOVE]; 
goog.ui.ActivityMonitor.userEventTypesDocuments_ =[goog.events.EventType.KEYDOWN, goog.events.EventType.KEYUP]; 
goog.ui.ActivityMonitor.Event = { ACTIVITY: 'activity' }; 
goog.ui.ActivityMonitor.prototype.disposeInternal = function() { 
  goog.ui.ActivityMonitor.superClass_.disposeInternal.call(this); 
  this.eventHandler_.dispose(); 
  this.eventHandler_ = null; 
  delete this.documents_; 
}; 
goog.ui.ActivityMonitor.prototype.addDocument = function(doc) { 
  this.documents_.push(doc); 
  this.eventHandler_.listen(doc, goog.ui.ActivityMonitor.userEventTypesDocuments_, this.handleEvent_, true); 
  this.eventHandler_.listen(doc, goog.ui.ActivityMonitor.userEventTypesBody_, this.handleEvent_, true); 
}; 
goog.ui.ActivityMonitor.prototype.removeDocument = function(doc) { 
  if(this.isDisposed()) { 
    return; 
  } 
  goog.array.remove(this.documents_, doc); 
  this.eventHandler_.unlisten(doc, goog.ui.ActivityMonitor.userEventTypesDocuments_, this.handleEvent_, true); 
  this.eventHandler_.unlisten(doc, goog.ui.ActivityMonitor.userEventTypesBody_, this.handleEvent_, true); 
}; 
goog.ui.ActivityMonitor.prototype.handleEvent_ = function(e) { 
  var update = false; 
  switch(e.type) { 
    case goog.events.EventType.MOUSEMOVE: 
      if(typeof this.lastMouseX_ == 'number' && this.lastMouseX_ != e.clientX || typeof this.lastMouseY_ == 'number' && this.lastMouseY_ != e.clientY) { 
        update = true; 
      } 
      this.lastMouseX_ = e.clientX; 
      this.lastMouseY_ = e.clientY; 
      break; 

    default: 
      update = true; 

  } 
  if(update) { 
    this.updateIdleTime_(goog.now(),(e.type)); 
  } 
}; 
goog.ui.ActivityMonitor.prototype.resetTimer = function() { 
  this.updateIdleTime_(goog.now(), 'manual'); 
}; 
goog.ui.ActivityMonitor.prototype.updateIdleTime_ = function(eventTime, eventType) { 
  this.lastEventTime_ = eventTime; 
  this.lastEventType_ = eventType; 
  if(eventTime > this.minEventTime_) { 
    this.dispatchEvent(goog.ui.ActivityMonitor.Event.ACTIVITY); 
    this.minEventTime_ = eventTime + goog.ui.ActivityMonitor.MIN_EVENT_SPACING; 
  } 
}; 
goog.ui.ActivityMonitor.prototype.getIdleTime = function(opt_now) { 
  var now = opt_now || goog.now(); 
  return now - this.lastEventTime_; 
}; 
goog.ui.ActivityMonitor.prototype.getLastEventType = function() { 
  return this.lastEventType_; 
}; 
goog.ui.ActivityMonitor.prototype.getLastEventTime = function() { 
  return this.lastEventTime_; 
}; 

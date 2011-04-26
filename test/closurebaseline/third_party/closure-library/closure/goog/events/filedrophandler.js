
goog.provide('goog.events.FileDropHandler'); 
goog.provide('goog.events.FileDropHandler.EventType'); 
goog.require('goog.array'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.events.BrowserEvent'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.events.FileDropHandler = function(element, opt_preventDropOutside) { 
  goog.events.EventTarget.call(this); 
  this.eventHandler_ = new goog.events.EventHandler(this); 
  var doc = element; 
  if(opt_preventDropOutside) { 
    doc = goog.dom.getOwnerDocument(element); 
  } 
  this.eventHandler_.listen(doc, goog.events.EventType.DRAGENTER, this.onDocDragEnter_); 
  if(doc != element) { 
    this.eventHandler_.listen(doc, goog.events.EventType.DRAGOVER, this.onDocDragOver_); 
  } 
  this.eventHandler_.listen(element, goog.events.EventType.DRAGOVER, this.onElemDragOver_); 
  this.eventHandler_.listen(element, goog.events.EventType.DROP, this.onElemDrop_); 
}; 
goog.inherits(goog.events.FileDropHandler, goog.events.EventTarget); 
goog.events.FileDropHandler.prototype.dndContainsFiles_ = false; 
goog.events.FileDropHandler.prototype.logger_ = goog.debug.Logger.getLogger('goog.events.FileDropHandler'); 
goog.events.FileDropHandler.EventType = { DROP: goog.events.EventType.DROP }; 
goog.events.FileDropHandler.prototype.disposeInternal = function() { 
  goog.events.FileDropHandler.superClass_.disposeInternal.call(this); 
  this.eventHandler_.dispose(); 
}; 
goog.events.FileDropHandler.prototype.dispatch_ = function(e) { 
  this.logger_.fine('Firing DROP event...'); 
  var event = new goog.events.BrowserEvent(e.getBrowserEvent()); 
  event.type = goog.events.FileDropHandler.EventType.DROP; 
  try { 
    this.dispatchEvent(event); 
  } finally { 
    event.dispose(); 
  } 
}; 
goog.events.FileDropHandler.prototype.onDocDragEnter_ = function(e) { 
  this.logger_.finer('"' + e.target.id + '" (' + e.target + ') dispatched: ' + e.type); 
  var dt = e.getBrowserEvent().dataTransfer; 
  this.dndContainsFiles_ = ! !(dt &&((dt.types &&(goog.array.contains(dt.types, 'Files') || goog.array.contains(dt.types, 'public.file-url'))) ||(dt.files && dt.files.length > 0))); 
  if(this.dndContainsFiles_) { 
    e.preventDefault(); 
  } 
  this.logger_.finer('dndContainsFiles_: ' + this.dndContainsFiles_); 
}; 
goog.events.FileDropHandler.prototype.onDocDragOver_ = function(e) { 
  this.logger_.finest('"' + e.target.id + '" (' + e.target + ') dispatched: ' + e.type); 
  if(this.dndContainsFiles_) { 
    e.preventDefault(); 
    var dt = e.getBrowserEvent().dataTransfer; 
    dt.dropEffect = 'none'; 
  } 
}; 
goog.events.FileDropHandler.prototype.onElemDragOver_ = function(e) { 
  this.logger_.finest('"' + e.target.id + '" (' + e.target + ') dispatched: ' + e.type); 
  if(this.dndContainsFiles_) { 
    e.preventDefault(); 
    e.stopPropagation(); 
    var dt = e.getBrowserEvent().dataTransfer; 
    dt.effectAllowed = 'all'; 
    dt.dropEffect = 'copy'; 
  } 
}; 
goog.events.FileDropHandler.prototype.onElemDrop_ = function(e) { 
  this.logger_.finer('"' + e.target.id + '" (' + e.target + ') dispatched: ' + e.type); 
  if(this.dndContainsFiles_) { 
    e.preventDefault(); 
    e.stopPropagation(); 
    this.dispatch_(e); 
  } 
}; 

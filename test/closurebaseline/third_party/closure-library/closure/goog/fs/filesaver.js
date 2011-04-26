
goog.provide('goog.fs.FileSaver'); 
goog.provide('goog.fs.FileSaver.EventType'); 
goog.provide('goog.fs.FileSaver.ProgressEvent'); 
goog.provide('goog.fs.FileSaver.ReadyState'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.fs.Error'); 
goog.fs.FileSaver = function(fileSaver) { 
  goog.base(this); 
  this.saver_ = fileSaver; 
  this.saver_.onwritestart = goog.bind(this.dispatchProgressEvent_, this); 
  this.saver_.onprogress = goog.bind(this.dispatchProgressEvent_, this); 
  this.saver_.onwrite = goog.bind(this.dispatchProgressEvent_, this); 
  this.saver_.onabort = goog.bind(this.dispatchProgressEvent_, this); 
  this.saver_.onerror = goog.bind(this.dispatchProgressEvent_, this); 
  this.saver_.onwriteend = goog.bind(this.dispatchProgressEvent_, this); 
}; 
goog.inherits(goog.fs.FileSaver, goog.events.EventTarget); 
goog.fs.FileSaver.ReadyState = { 
  INIT: 0, 
  WRITING: 1, 
  DONE: 2 
}; 
goog.fs.FileSaver.EventType = { 
  WRITE_START: 'writestart', 
  PROGRESS: 'progress', 
  WRITE: 'write', 
  ABORT: 'abort', 
  ERROR: 'error', 
  WRITE_END: 'writeend' 
}; 
goog.fs.FileSaver.prototype.abort = function() { 
  try { 
    this.saver_.abort(); 
  } catch(e) { 
    throw new goog.fs.Error(e.code, 'aborting save'); 
  } 
}; 
goog.fs.FileSaver.prototype.getReadyState = function() { 
  return(this.saver_.readyState); 
}; 
goog.fs.FileSaver.prototype.getError = function() { 
  return this.saver_.error && new goog.fs.Error(this.saver_.error.code, 'saving file'); 
}; 
goog.fs.FileSaver.prototype.dispatchProgressEvent_ = function(event) { 
  this.dispatchEvent(new goog.fs.FileSaver.ProgressEvent(event, this)); 
}; 
goog.fs.FileSaver.prototype.disposeInternal = function() { 
  delete this.saver_; 
  goog.base(this, 'disposeInternal'); 
}; 
goog.fs.FileSaver.ProgressEvent = function(event, target) { 
  goog.base(this, event.type, target); 
  this.event_ = event; 
}; 
goog.inherits(goog.fs.FileSaver.ProgressEvent, goog.events.Event); 
goog.fs.FileSaver.ProgressEvent.prototype.isLengthComputable = function() { 
  return this.event_.lengthComputable; 
}; 
goog.fs.FileSaver.ProgressEvent.prototype.getLoaded = function() { 
  return this.event_.loaded; 
}; 
goog.fs.FileSaver.ProgressEvent.prototype.getTotal = function() { 
  return this.event_.total; 
}; 

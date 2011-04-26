
goog.provide('goog.testing.fs.FileWriter'); 
goog.provide('goog.testing.fs.FileWriter.ProgressEvent'); 
goog.require('goog.Timer'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.fs.Error'); 
goog.require('goog.fs.FileSaver.EventType'); 
goog.require('goog.fs.FileSaver.ReadyState'); 
goog.require('goog.string'); 
goog.require('goog.testing.fs.File'); 
goog.testing.fs.FileWriter = function(fileEntry) { 
  goog.base(this); 
  this.fileEntry_ = fileEntry; 
  this.file_ = fileEntry.fileSync(); 
  this.readyState_ = goog.fs.FileSaver.ReadyState.INIT; 
}; 
goog.inherits(goog.testing.fs.FileWriter, goog.events.EventTarget); 
goog.testing.fs.FileWriter.prototype.error_; 
goog.testing.fs.FileWriter.prototype.aborted_ = false; 
goog.testing.fs.FileWriter.prototype.position_ = 0; 
goog.testing.fs.FileWriter.prototype.getReadyState = function() { 
  return this.readyState_; 
}; 
goog.testing.fs.FileWriter.prototype.getError = function() { 
  return this.error_; 
}; 
goog.testing.fs.FileWriter.prototype.getPosition = function() { 
  return this.position_; 
}; 
goog.testing.fs.FileWriter.prototype.getLength = function() { 
  return this.file_.size; 
}; 
goog.testing.fs.FileWriter.prototype.abort = function() { 
  if(this.readyState_ != goog.fs.FileSaver.ReadyState.WRITING) { 
    var msg = 'aborting save of ' + this.fileEntry_.getFullPath(); 
    throw new goog.fs.Error(goog.fs.Error.ErrorCode.INVALID_STATE, msg); 
  } 
  this.aborted_ = true; 
}; 
goog.testing.fs.FileWriter.prototype.write = function(blob) { 
  if(this.readyState_ == goog.fs.FileSaver.ReadyState.WRITING) { 
    var msg = 'writing to ' + this.fileEntry_.getFullPath(); 
    throw new goog.fs.Error(goog.fs.Error.ErrorCode.INVALID_STATE, msg); 
  } 
  this.readyState_ = goog.fs.FileSaver.ReadyState.WRITING; 
  goog.Timer.callOnce(function() { 
    if(this.aborted_) { 
      this.abort_(blob.size); 
      return; 
    } 
    this.progressEvent_(goog.fs.FileSaver.EventType.WRITE_START, 0, blob.size); 
    var fileString = this.file_.toString(); 
    this.file_.setDataInternal(fileString.substring(0, this.position_) + blob.toString() + fileString.substring(this.position_ + blob.size, fileString.length)); 
    this.position_ += blob.size; 
    this.progressEvent_(goog.fs.FileSaver.EventType.WRITE, blob.size, blob.size); 
    this.readyState_ = goog.fs.FileSaver.ReadyState.DONE; 
    this.progressEvent_(goog.fs.FileSaver.EventType.WRITE_END, blob.size, blob.size); 
  }, 0, this); 
}; 
goog.testing.fs.FileWriter.prototype.truncate = function(size) { 
  if(this.readyState_ == goog.fs.FileSaver.ReadyState.WRITING) { 
    var msg = 'truncating ' + this.fileEntry_.getFullPath(); 
    throw new goog.fs.Error(goog.fs.Error.ErrorCode.INVALID_STATE, msg); 
  } 
  this.readyState_ = goog.fs.FileSaver.ReadyState.WRITING; 
  goog.Timer.callOnce(function() { 
    if(this.aborted_) { 
      this.abort_(size); 
      return; 
    } 
    this.progressEvent_(goog.fs.FileSaver.EventType.WRITE_START, 0, size); 
    var fileString = this.file_.toString(); 
    if(size > fileString.length) { 
      this.file_.setDataInternal(fileString + goog.string.repeat('\0', size - fileString.length)); 
    } else { 
      this.file_.setDataInternal(fileString.substring(0, size)); 
    } 
    this.position_ = Math.min(this.position_, size); 
    this.progressEvent_(goog.fs.FileSaver.EventType.WRITE, size, size); 
    this.readyState_ = goog.fs.FileSaver.ReadyState.DONE; 
    this.progressEvent_(goog.fs.FileSaver.EventType.WRITE_END, size, size); 
  }, 0, this); 
}; 
goog.testing.fs.FileWriter.prototype.seek = function(offset) { 
  if(this.readyState_ == goog.fs.FileSaver.ReadyState.WRITING) { 
    var msg = 'truncating ' + this.fileEntry_.getFullPath(); 
    throw new goog.fs.Error(goog.fs.Error.ErrorCode.INVALID_STATE, msg); 
  } 
  if(offset < 0) { 
    this.position_ = Math.max(0, this.file_.size + offset); 
  } else { 
    this.position_ = Math.min(offset, this.file_.size); 
  } 
}; 
goog.testing.fs.FileWriter.prototype.abort_ = function(total) { 
  this.error_ = new goog.fs.Error(goog.fs.Error.ErrorCode.ABORT, 'saving ' + this.fileEntry_.getFullPath()); 
  this.progressEvent_(goog.fs.FileSaver.EventType.ERROR, 0, total); 
  this.progressEvent_(goog.fs.FileSaver.EventType.ABORT, 0, total); 
  this.readyState_ = goog.fs.FileSaver.ReadyState.DONE; 
  this.progressEvent_(goog.fs.FileSaver.EventType.WRITE_END, 0, total); 
  this.aborted_ = false; 
}; 
goog.testing.fs.FileWriter.prototype.progressEvent_ = function(type, loaded, total) { 
  if(type == goog.fs.FileSaver.EventType.WRITE) { 
    this.file_.lastModifiedDate = new Date(goog.now()); 
  } 
  this.dispatchEvent(new goog.testing.fs.FileWriter.ProgressEvent(type, loaded, total)); 
}; 
goog.testing.fs.FileWriter.ProgressEvent = function(type, loaded, total) { 
  goog.base(this, type); 
  this.loaded_ = loaded; 
  this.total_ = total; 
}; 
goog.inherits(goog.testing.fs.FileWriter.ProgressEvent, goog.events.Event); 
goog.testing.fs.FileWriter.ProgressEvent.prototype.isLengthComputable = function() { 
  return true; 
}; 
goog.testing.fs.FileWriter.ProgressEvent.prototype.getLoaded = function() { 
  return this.loaded_; 
}; 
goog.testing.fs.FileWriter.ProgressEvent.prototype.getTotal = function() { 
  return this.total_; 
}; 

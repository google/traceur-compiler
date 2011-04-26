
goog.provide('goog.gears.Worker'); 
goog.provide('goog.gears.Worker.EventType'); 
goog.provide('goog.gears.WorkerEvent'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventTarget'); 
goog.gears.Worker = function(workerPool, opt_id) { 
  goog.events.EventTarget.call(this); 
  this.workerPool_ = workerPool; 
  if(opt_id != null) { 
    this.init(opt_id); 
  } 
}; 
goog.inherits(goog.gears.Worker, goog.events.EventTarget); 
goog.gears.Worker.prototype.handleMessage = function(messageObject) { 
  var messageEvent = new goog.gears.WorkerEvent(goog.gears.Worker.EventType.MESSAGE, messageObject); 
  if(this.dispatchEvent(messageEvent)) { 
    if(goog.gears.Worker.isCommandLike(messageObject.body)) { 
      this.dispatchEvent(new goog.gears.WorkerEvent(goog.gears.Worker.EventType.COMMAND, messageObject)); 
    } 
  } 
}; 
goog.gears.Worker.prototype.id_ = null; 
goog.gears.Worker.prototype.init = function(id) { 
  if(this.id_ != null) { 
    throw Error('Can only set the worker id once'); 
  } 
  this.id_ = id; 
  this.workerPool_.registerWorker(this); 
}; 
goog.gears.Worker.prototype.sendCommand = function(commandId, params) { 
  this.sendMessage([commandId, params]); 
}; 
goog.gears.Worker.prototype.sendMessage = function(message) { 
  this.workerPool_.sendMessage(message, this); 
}; 
goog.gears.Worker.prototype.getId = function() { 
  if(this.id_ == null) { 
    throw Error('The worker has not yet been initialized'); 
  } 
  return this.id_; 
}; 
goog.gears.Worker.isCommandLike = function(obj) { 
  return goog.isArray(obj) && obj.length == 2 && goog.isNumber((obj)[0]); 
}; 
goog.gears.Worker.prototype.disposeInternal = function() { 
  goog.gears.Worker.superClass_.disposeInternal.call(this); 
  this.workerPool_.unregisterWorker(this); 
  this.workerPool_ = null; 
}; 
goog.gears.Worker.EventType = { 
  MESSAGE: 'message', 
  COMMAND: 'command' 
}; 
goog.gears.WorkerEvent = function(type, messageObject) { 
  goog.events.Event.call(this, type); 
  this.message = messageObject.body; 
  this.json = this.message; 
  this.messageObject = messageObject; 
}; 
goog.inherits(goog.gears.WorkerEvent, goog.events.Event); 

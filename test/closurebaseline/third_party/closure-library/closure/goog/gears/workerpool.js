
goog.provide('goog.gears.WorkerPool'); 
goog.provide('goog.gears.WorkerPool.Event'); 
goog.provide('goog.gears.WorkerPool.EventType'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.gears'); 
goog.require('goog.gears.Worker'); 
goog.gears.WorkerPool = function() { 
  goog.events.EventTarget.call(this); 
  this.workers_ = { }; 
  var workerPool =(goog.getObjectByName('google.gears.workerPool')); 
  if(workerPool) { 
    this.workerPool_ = workerPool; 
  } else { 
    this.workerPool_ = this.getGearsWorkerPool(); 
  } 
  this.workerPool_.onmessage = goog.bind(this.handleMessage_, this); 
}; 
goog.inherits(goog.gears.WorkerPool, goog.events.EventTarget); 
goog.gears.WorkerPool.EventType = { UNKNOWN_WORKER: 'uknown_worker' }; 
goog.gears.WorkerPool.prototype.workerPool_ = null; 
goog.gears.WorkerPool.prototype.getGearsWorkerPool = function() { 
  var factory = goog.gears.getFactory(); 
  return factory.create('beta.workerpool'); 
}; 
goog.gears.WorkerPool.prototype.setErrorHandler = function(fn, opt_handler) { 
  this.workerPool_.onerror = goog.bind(fn, opt_handler); 
}; 
goog.gears.WorkerPool.prototype.createWorker = function(code) { 
  var workerId = this.workerPool_.createWorker(code); 
  var worker = new goog.gears.Worker(this, workerId); 
  this.registerWorker(worker); 
  return worker; 
}; 
goog.gears.WorkerPool.prototype.createWorkerFromUrl = function(url) { 
  var workerId = this.workerPool_.createWorkerFromUrl(url); 
  var worker = new goog.gears.Worker(this, workerId); 
  this.registerWorker(worker); 
  return worker; 
}; 
goog.gears.WorkerPool.prototype.allowCrossOrigin = function() { 
  this.workerPool_.allowCrossOrigin(); 
}; 
goog.gears.WorkerPool.prototype.sendMessage = function(message, worker) { 
  this.workerPool_.sendMessage(message, worker.getId()); 
}; 
goog.gears.WorkerPool.prototype.handleMessage_ = function(message, senderId, messageObject) { 
  if(! this.isDisposed()) { 
    var workers = this.workers_; 
    if(! workers[senderId]) { 
      this.dispatchEvent(new goog.gears.WorkerPool.Event(goog.gears.WorkerPool.EventType.UNKNOWN_WORKER, senderId, messageObject)); 
    } 
    var worker = workers[senderId]; 
    if(worker) { 
      worker.handleMessage(messageObject); 
    } 
  } 
}; 
goog.gears.WorkerPool.prototype.registerWorker = function(worker) { 
  this.workers_[worker.getId()]= worker; 
}; 
goog.gears.WorkerPool.prototype.unregisterWorker = function(worker) { 
  delete this.workers_[worker.getId()]; 
}; 
goog.gears.WorkerPool.prototype.disposeInternal = function() { 
  goog.gears.WorkerPool.superClass_.disposeInternal.call(this); 
  this.workerPool_ = null; 
  delete this.workers_; 
}; 
goog.gears.WorkerPool.Event = function(type, senderId, messageObject) { 
  goog.events.Event.call(this, type); 
  this.senderId = senderId; 
  this.message = messageObject.body; 
  this.messageObject = messageObject; 
}; 
goog.inherits(goog.gears.WorkerPool.Event, goog.events.Event); 

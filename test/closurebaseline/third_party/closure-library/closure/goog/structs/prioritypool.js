
goog.provide('goog.structs.PriorityPool'); 
goog.require('goog.structs.Pool'); 
goog.require('goog.structs.PriorityQueue'); 
goog.structs.PriorityPool = function(opt_minCount, opt_maxCount) { 
  this.requestQueue_ = new goog.structs.PriorityQueue(); 
  goog.structs.Pool.call(this, opt_minCount, opt_maxCount); 
}; 
goog.inherits(goog.structs.PriorityPool, goog.structs.Pool); 
goog.structs.PriorityPool.prototype.delayTimeout_; 
goog.structs.PriorityPool.DEFAULT_PRIORITY_ = 100; 
goog.structs.PriorityPool.prototype.setDelay = function(delay) { 
  goog.base(this, 'setDelay', delay); 
  if(! goog.isDefAndNotNull(this.lastAccess)) { 
    return; 
  } 
  goog.global.clearTimeout(this.delayTimeout_); 
  this.delayTimeout_ = goog.global.setTimeout(goog.bind(this.handleQueueRequests_, this), this.delay + this.lastAccess - goog.now()); 
  this.handleQueueRequests_(); 
}; 
goog.structs.PriorityPool.prototype.getObject = function(opt_callback, opt_priority) { 
  if(! opt_callback) { 
    var result = goog.base(this, 'getObject'); 
    if(result && this.delay) { 
      this.delayTimeout_ = goog.global.setTimeout(goog.bind(this.handleQueueRequests_, this), this.delay); 
    } 
    return result; 
  } 
  var priority = opt_priority || goog.structs.PriorityPool.DEFAULT_PRIORITY_; 
  this.requestQueue_.enqueue(priority, opt_callback); 
  this.handleQueueRequests_(); 
  return undefined; 
}; 
goog.structs.PriorityPool.prototype.handleQueueRequests_ = function() { 
  var requestQueue = this.requestQueue_; 
  while(requestQueue.getCount() > 0) { 
    var obj = this.getObject(); 
    if(! obj) { 
      return; 
    } else { 
      var requestCallback = requestQueue.dequeue(); 
      requestCallback.apply(this,[obj]); 
    } 
  } 
}; 
goog.structs.PriorityPool.prototype.addFreeObject = function(obj) { 
  goog.structs.PriorityPool.superClass_.addFreeObject.call(this, obj); 
  this.handleQueueRequests_(); 
}; 
goog.structs.PriorityPool.prototype.adjustForMinMax = function() { 
  goog.structs.PriorityPool.superClass_.adjustForMinMax.call(this); 
  this.handleQueueRequests_(); 
}; 
goog.structs.PriorityPool.prototype.disposeInternal = function() { 
  goog.structs.PriorityPool.superClass_.disposeInternal.call(this); 
  goog.global.clearTimeout(this.delayTimeout_); 
  this.requestQueue_.clear(); 
  this.requestQueue_ = null; 
}; 

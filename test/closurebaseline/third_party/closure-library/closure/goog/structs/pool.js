
goog.provide('goog.structs.Pool'); 
goog.require('goog.Disposable'); 
goog.require('goog.structs.Queue'); 
goog.require('goog.structs.Set'); 
goog.structs.Pool = function(opt_minCount, opt_maxCount) { 
  goog.Disposable.call(this); 
  this.minCount_ = opt_minCount || 0; 
  this.maxCount_ = opt_maxCount || 10; 
  if(this.minCount_ > this.maxCount_) { 
    throw Error(goog.structs.Pool.ERROR_MIN_MAX_); 
  } 
  this.freeQueue_ = new goog.structs.Queue(); 
  this.inUseSet_ = new goog.structs.Set(); 
  this.delay = 0; 
  this.lastAccess = null; 
  this.adjustForMinMax(); 
  var magicProps = { canBeReused: 0 }; 
}; 
goog.inherits(goog.structs.Pool, goog.Disposable); 
goog.structs.Pool.ERROR_MIN_MAX_ = '[goog.structs.Pool] Min can not be greater than max'; 
goog.structs.Pool.ERROR_DISPOSE_UNRELEASED_OBJS_ = '[goog.structs.Pool] Objects not released'; 
goog.structs.Pool.prototype.setMinimumCount = function(min) { 
  if(min > this.maxCount_) { 
    throw Error(goog.structs.Pool.ERROR_MIN_MAX_); 
  } 
  this.minCount_ = min; 
  this.adjustForMinMax(); 
}; 
goog.structs.Pool.prototype.setMaximumCount = function(max) { 
  if(max < this.minCount_) { 
    throw Error(goog.structs.Pool.ERROR_MIN_MAX_); 
  } 
  this.maxCount_ = max; 
  this.adjustForMinMax(); 
}; 
goog.structs.Pool.prototype.setDelay = function(delay) { 
  this.delay = delay; 
}; 
goog.structs.Pool.prototype.getObject = function() { 
  var time = goog.now(); 
  if(goog.isDefAndNotNull(this.lastAccess) && time - this.lastAccess < this.delay) { 
    return undefined; 
  } 
  var obj = this.removeFreeObject_(); 
  if(obj) { 
    this.lastAccess = time; 
    this.inUseSet_.add(obj); 
  } 
  return obj; 
}; 
goog.structs.Pool.prototype.releaseObject = function(obj) { 
  if(this.inUseSet_.remove(obj)) { 
    this.addFreeObject(obj); 
    return true; 
  } 
  return false; 
}; 
goog.structs.Pool.prototype.removeFreeObject_ = function() { 
  var obj; 
  while(this.getFreeCount() > 0) { 
    obj =(this.freeQueue_.dequeue()); 
    if(! this.objectCanBeReused(obj)) { 
      this.adjustForMinMax(); 
    } else { 
      break; 
    } 
  } 
  if(! obj && this.getCount() < this.maxCount_) { 
    obj = this.createObject(); 
  } 
  return obj; 
}; 
goog.structs.Pool.prototype.addFreeObject = function(obj) { 
  this.inUseSet_.remove(obj); 
  if(this.objectCanBeReused(obj) && this.getCount() < this.maxCount_) { 
    this.freeQueue_.enqueue(obj); 
  } else { 
    this.disposeObject(obj); 
  } 
}; 
goog.structs.Pool.prototype.adjustForMinMax = function() { 
  var freeQueue = this.freeQueue_; 
  while(this.getCount() < this.minCount_) { 
    freeQueue.enqueue(this.createObject()); 
  } 
  while(this.getCount() > this.maxCount_ && this.getFreeCount() > 0) { 
    this.disposeObject((freeQueue.dequeue())); 
  } 
}; 
goog.structs.Pool.prototype.createObject = function() { 
  return { }; 
}; 
goog.structs.Pool.prototype.disposeObject = function(obj) { 
  if(typeof obj.dispose == 'function') { 
    obj.dispose(); 
  } else { 
    for(var i in obj) { 
      obj[i]= null; 
    } 
  } 
}; 
goog.structs.Pool.prototype.objectCanBeReused = function(obj) { 
  if(typeof obj.canBeReused == 'function') { 
    return obj.canBeReused(); 
  } 
  return true; 
}; 
goog.structs.Pool.prototype.contains = function(obj) { 
  return this.freeQueue_.contains(obj) || this.inUseSet_.contains(obj); 
}; 
goog.structs.Pool.prototype.getCount = function() { 
  return this.freeQueue_.getCount() + this.inUseSet_.getCount(); 
}; 
goog.structs.Pool.prototype.getInUseCount = function() { 
  return this.inUseSet_.getCount(); 
}; 
goog.structs.Pool.prototype.getFreeCount = function() { 
  return this.freeQueue_.getCount(); 
}; 
goog.structs.Pool.prototype.isEmpty = function() { 
  return this.freeQueue_.isEmpty() && this.inUseSet_.isEmpty(); 
}; 
goog.structs.Pool.prototype.disposeInternal = function() { 
  goog.structs.Pool.superClass_.disposeInternal.call(this); 
  if(this.getInUseCount() > 0) { 
    throw Error(goog.structs.Pool.ERROR_DISPOSE_UNRELEASED_OBJS_); 
  } 
  delete this.inUseSet_; 
  var freeQueue = this.freeQueue_; 
  while(! freeQueue.isEmpty()) { 
    this.disposeObject((freeQueue.dequeue())); 
  } 
  delete this.freeQueue_; 
}; 

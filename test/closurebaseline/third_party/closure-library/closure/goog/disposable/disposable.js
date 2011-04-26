
goog.provide('goog.Disposable'); 
goog.provide('goog.dispose'); 
goog.require('goog.disposable.IDisposable'); 
goog.Disposable = function() { 
  if(goog.Disposable.ENABLE_MONITORING) { 
    goog.Disposable.instances_[goog.getUid(this)]= this; 
  } 
}; 
goog.Disposable.ENABLE_MONITORING = false; 
goog.Disposable.instances_ = { }; 
goog.Disposable.getUndisposedObjects = function() { 
  var ret =[]; 
  for(var id in goog.Disposable.instances_) { 
    if(goog.Disposable.instances_.hasOwnProperty(id)) { 
      ret.push(goog.Disposable.instances_[Number(id)]); 
    } 
  } 
  return ret; 
}; 
goog.Disposable.clearUndisposedObjects = function() { 
  goog.Disposable.instances_ = { }; 
}; 
goog.Disposable.prototype.disposed_ = false; 
goog.Disposable.prototype.isDisposed = function() { 
  return this.disposed_; 
}; 
goog.Disposable.prototype.getDisposed = goog.Disposable.prototype.isDisposed; 
goog.Disposable.prototype.dispose = function() { 
  if(! this.disposed_) { 
    this.disposed_ = true; 
    this.disposeInternal(); 
    if(goog.Disposable.ENABLE_MONITORING) { 
      var uid = goog.getUid(this); 
      if(! goog.Disposable.instances_.hasOwnProperty(uid)) { 
        throw Error(this + ' did not call the goog.Disposable base ' + 'constructor or was disposed of after a clearUndisposedObjects ' + 'call'); 
      } 
      delete goog.Disposable.instances_[uid]; 
    } 
  } 
}; 
goog.Disposable.prototype.disposeInternal = function() { }; 
goog.dispose = function(obj) { 
  if(obj && typeof obj.dispose == 'function') { 
    obj.dispose(); 
  } 
}; 

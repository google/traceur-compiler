
goog.provide('goog.dom.SavedRange'); 
goog.require('goog.Disposable'); 
goog.require('goog.debug.Logger'); 
goog.dom.SavedRange = function() { 
  goog.Disposable.call(this); 
}; 
goog.inherits(goog.dom.SavedRange, goog.Disposable); 
goog.dom.SavedRange.logger_ = goog.debug.Logger.getLogger('goog.dom.SavedRange'); 
goog.dom.SavedRange.prototype.restore = function(opt_stayAlive) { 
  if(this.isDisposed()) { 
    goog.dom.SavedRange.logger_.severe('Disposed SavedRange objects cannot be restored.'); 
  } 
  var range = this.restoreInternal(); 
  if(! opt_stayAlive) { 
    this.dispose(); 
  } 
  return range; 
}; 
goog.dom.SavedRange.prototype.restoreInternal = goog.abstractMethod; 

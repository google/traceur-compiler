
goog.provide('goog.testing.MockRandom'); 
goog.require('goog.Disposable'); 
goog.testing.MockRandom = function(sequence, opt_install) { 
  goog.Disposable.call(this); 
  this.sequence_ = sequence ||[]; 
  this.mathRandom_ = Math.random; 
  if(opt_install) { 
    this.install(); 
  } 
}; 
goog.inherits(goog.testing.MockRandom, goog.Disposable); 
goog.testing.MockRandom.prototype.installed_; 
goog.testing.MockRandom.prototype.install = function() { 
  if(! this.installed_) { 
    Math.random = goog.bind(this.random, this); 
    this.installed_ = true; 
  } 
}; 
goog.testing.MockRandom.prototype.random = function() { 
  return this.hasMoreValues() ? this.sequence_.shift(): this.mathRandom_(); 
}; 
goog.testing.MockRandom.prototype.hasMoreValues = function() { 
  return this.sequence_.length > 0; 
}; 
goog.testing.MockRandom.prototype.inject = function(values) { 
  if(goog.isArray(values)) { 
    this.sequence_ = values.concat(this.sequence_); 
  } else { 
    this.sequence_.splice(0, 0, values); 
  } 
}; 
goog.testing.MockRandom.prototype.uninstall = function() { 
  if(this.installed_) { 
    Math.random = this.mathRandom_; 
    this.installed_ = false; 
  } 
}; 
goog.testing.MockRandom.prototype.disposeInternal = function() { 
  this.uninstall(); 
  delete this.sequence_; 
  delete this.mathRandom_; 
  goog.testing.MockRandom.superClass_.disposeInternal.call(this); 
}; 


goog.provide('goog.testing.PseudoRandom'); 
goog.require('goog.Disposable'); 
goog.testing.PseudoRandom = function(opt_seed, opt_install) { 
  goog.Disposable.call(this); 
  this.seed_ = opt_seed || goog.testing.PseudoRandom.seedUniquifier_ ++ + goog.now(); 
  if(opt_install) { 
    this.install(); 
  } 
}; 
goog.inherits(goog.testing.PseudoRandom, goog.Disposable); 
goog.testing.PseudoRandom.seedUniquifier_ = 0; 
goog.testing.PseudoRandom.A = 48271; 
goog.testing.PseudoRandom.M = 2147483647; 
goog.testing.PseudoRandom.Q = 44488; 
goog.testing.PseudoRandom.R = 3399; 
goog.testing.PseudoRandom.ONE_OVER_M = 1.0 / goog.testing.PseudoRandom.M; 
goog.testing.PseudoRandom.prototype.installed_; 
goog.testing.PseudoRandom.prototype.mathRandom_; 
goog.testing.PseudoRandom.prototype.install = function() { 
  if(! this.installed_) { 
    this.mathRandom_ = Math.random; 
    Math.random = goog.bind(this.random, this); 
    this.installed_ = true; 
  } 
}; 
goog.testing.PseudoRandom.prototype.disposeInternal = function() { 
  goog.testing.PseudoRandom.superClass_.disposeInternal.call(this); 
  this.uninstall(); 
}; 
goog.testing.PseudoRandom.prototype.uninstall = function() { 
  if(this.installed_) { 
    Math.random = this.mathRandom_; 
    this.installed_ = false; 
  } 
}; 
goog.testing.PseudoRandom.prototype.random = function() { 
  var hi = this.seed_ / goog.testing.PseudoRandom.Q; 
  var lo = this.seed_ % goog.testing.PseudoRandom.Q; 
  var test = goog.testing.PseudoRandom.A * lo - goog.testing.PseudoRandom.R * hi; 
  if(test > 0) { 
    this.seed_ = test; 
  } else { 
    this.seed_ = test + goog.testing.PseudoRandom.M; 
  } 
  return this.seed_ * goog.testing.PseudoRandom.ONE_OVER_M; 
}; 

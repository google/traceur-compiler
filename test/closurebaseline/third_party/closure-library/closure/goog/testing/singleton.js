
goog.provide('goog.testing.singleton'); 
goog.require('goog.array'); 
goog.testing.singletons_ =[]; 
goog.testing.singleton.addSingletonGetter = function(ctor) { 
  ctor.getInstance = function() { 
    if(! ctor.instance_) { 
      ctor.instance_ = new ctor(); 
      goog.testing.singletons_.push(ctor); 
    } 
    return ctor.instance_; 
  }; 
}; 
goog.testing.singleton.reset = function() { 
  goog.array.forEach(goog.testing.singletons_, function(ctor) { 
    delete ctor.instance_; 
  }); 
  goog.array.clear(goog.testing.singletons_); 
}; 
goog.addSingletonGetter = goog.testing.singleton.addSingletonGetter; 

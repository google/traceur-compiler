
goog.provide('goog.debug.EntryPointMonitor'); 
goog.provide('goog.debug.entryPointRegistry'); 
goog.debug.EntryPointMonitor = function() { }; 
goog.debug.EntryPointMonitor.prototype.wrap; 
goog.debug.EntryPointMonitor.prototype.unwrap; 
goog.debug.entryPointRegistry.refList_ =[]; 
goog.debug.entryPointRegistry.register = function(callback) { 
  goog.debug.entryPointRegistry.refList_[goog.debug.entryPointRegistry.refList_.length]= callback; 
}; 
goog.debug.entryPointRegistry.monitorAll = function(monitor) { 
  var transformer = goog.bind(monitor.wrap, monitor); 
  for(var i = 0; i < goog.debug.entryPointRegistry.refList_.length; i ++) { 
    goog.debug.entryPointRegistry.refList_[i](transformer); 
  } 
}; 
goog.debug.entryPointRegistry.unmonitorAllIfPossible = function(monitor) { 
  var transformer = goog.bind(monitor.unwrap, monitor); 
  for(var i = 0; i < goog.debug.entryPointRegistry.refList_.length; i ++) { 
    goog.debug.entryPointRegistry.refList_[i](transformer); 
  } 
}; 

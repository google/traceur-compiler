
goog.provide('goog.proto2.Util'); 
goog.require('goog.asserts'); 
goog.proto2.Util.PBCHECK = ! COMPILED; 
goog.proto2.Util.assert = function(condition, opt_message) { 
  if(goog.proto2.Util.PBCHECK) { 
    goog.asserts.assert(condition, opt_message); 
  } 
}; 
goog.proto2.Util.conductChecks = function() { 
  return goog.proto2.Util.PBCHECK; 
}; 

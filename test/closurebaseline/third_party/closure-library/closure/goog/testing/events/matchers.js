
goog.provide('goog.testing.events.EventMatcher'); 
goog.require('goog.events.Event'); 
goog.require('goog.testing.mockmatchers.ArgumentMatcher'); 
goog.testing.events.EventMatcher = function(type) { 
  goog.testing.mockmatchers.ArgumentMatcher.call(this, function(obj) { 
    return obj instanceof goog.events.Event && obj.type == type; 
  }, 'isEventOfType(' + type + ')'); 
}; 
goog.inherits(goog.testing.events.EventMatcher, goog.testing.mockmatchers.ArgumentMatcher); 

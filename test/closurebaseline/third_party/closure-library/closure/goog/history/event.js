
goog.provide('goog.history.Event'); 
goog.require('goog.events.Event'); 
goog.require('goog.history.EventType'); 
goog.history.Event = function(token, isNavigation) { 
  goog.events.Event.call(this, goog.history.EventType.NAVIGATE); 
  this.token = token; 
  this.isNavigation = isNavigation; 
}; 
goog.inherits(goog.history.Event, goog.events.Event); 

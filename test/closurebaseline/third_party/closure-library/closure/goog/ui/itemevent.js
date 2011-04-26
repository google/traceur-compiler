
goog.provide('goog.ui.ItemEvent'); 
goog.require('goog.events.Event'); 
goog.ui.ItemEvent = function(type, target, item) { 
  goog.events.Event.call(this, type, target); 
  this.item = item; 
}; 
goog.inherits(goog.ui.ItemEvent, goog.events.Event); 

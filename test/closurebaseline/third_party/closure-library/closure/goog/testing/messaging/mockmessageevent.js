
goog.provide('goog.testing.messaging.MockMessageEvent'); 
goog.require('goog.events.BrowserEvent'); 
goog.require('goog.events.EventType'); 
goog.require('goog.testing.events'); 
goog.testing.messaging.MockMessageEvent = function(data, opt_origin, opt_lastEventId, opt_source, opt_ports) { 
  goog.base(this, goog.events.EventType.MESSAGE); 
  this.data = data; 
  this.origin = opt_origin || null; 
  this.lastEventId = opt_lastEventId || null; 
  this.source = opt_source || null; 
  this.ports = opt_ports || null; 
}; 
goog.inherits(goog.testing.messaging.MockMessageEvent, goog.testing.events.Event); 
goog.testing.messaging.MockMessageEvent.wrap = function(data, opt_origin, opt_lastEventId, opt_source, opt_ports) { 
  return new goog.events.BrowserEvent(new goog.testing.messaging.MockMessageEvent(data, opt_origin, opt_lastEventId, opt_source, opt_ports)); 
}; 

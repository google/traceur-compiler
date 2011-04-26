
goog.provide('goog.testing.events.EventObserver'); 
goog.require('goog.array'); 
goog.testing.events.EventObserver = function() { 
  this.events_ =[]; 
}; 
goog.testing.events.EventObserver.prototype.handleEvent = function(e) { 
  this.events_.push(e); 
}; 
goog.testing.events.EventObserver.prototype.getEvents = function(opt_type) { 
  var events = goog.array.clone(this.events_); 
  if(opt_type) { 
    events = goog.array.filter(events, function(event) { 
      return event.type == opt_type; 
    }); 
  } 
  return events; 
}; 

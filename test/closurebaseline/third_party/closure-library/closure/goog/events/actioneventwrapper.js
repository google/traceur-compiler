
goog.provide('goog.events.actionEventWrapper'); 
goog.require('goog.events'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.events.EventType'); 
goog.require('goog.events.EventWrapper'); 
goog.require('goog.events.KeyCodes'); 
goog.events.ActionEventWrapper_ = function() { }; 
goog.events.actionEventWrapper = new goog.events.ActionEventWrapper_(); 
goog.events.ActionEventWrapper_.EVENT_TYPES_ =[goog.events.EventType.CLICK, goog.events.EventType.KEYPRESS]; 
goog.events.ActionEventWrapper_.prototype.listen = function(target, listener, opt_capt, opt_scope, opt_eventHandler) { 
  var callback = function(e) { 
    if(e.type == goog.events.EventType.CLICK && e.isMouseActionButton() || e.type == goog.events.EventType.KEYPRESS &&(e.keyCode == goog.events.KeyCodes.ENTER || e.keyCode == goog.events.KeyCodes.MAC_ENTER)) { 
      listener.call(opt_scope, e); 
    } 
  }; 
  callback.listener_ = listener; 
  callback.scope_ = opt_scope; 
  if(opt_eventHandler) { 
    opt_eventHandler.listen(target, goog.events.ActionEventWrapper_.EVENT_TYPES_, callback); 
  } else { 
    goog.events.listen(target, goog.events.ActionEventWrapper_.EVENT_TYPES_, callback); 
  } 
}; 
goog.events.ActionEventWrapper_.prototype.unlisten = function(target, listener, opt_capt, opt_scope, opt_eventHandler) { 
  for(var type, j = 0; type = goog.events.ActionEventWrapper_.EVENT_TYPES_[j]; j ++) { 
    var listeners = goog.events.getListeners(target, type, false); 
    for(var obj, i = 0; obj = listeners[i]; i ++) { 
      if(obj.listener.listener_ == listener && obj.listener.scope_ == opt_scope) { 
        if(opt_eventHandler) { 
          opt_eventHandler.unlisten(target, type, obj.listener); 
        } else { 
          goog.events.unlisten(target, type, obj.listener); 
        } 
        break; 
      } 
    } 
  } 
}; 

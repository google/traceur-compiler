
goog.provide('goog.net.Jsonp'); 
goog.require('goog.Uri'); 
goog.require('goog.dom'); 
goog.net.Jsonp = function(uri, opt_callbackParamName) { 
  this.uri_ = new goog.Uri(uri); 
  this.callbackParamName_ = opt_callbackParamName ? opt_callbackParamName: 'callback'; 
  this.timeout_ = 5000; 
}; 
goog.net.Jsonp.CALLBACKS = '_callbacks_'; 
goog.net.Jsonp.scriptCounter_ = 0; 
goog.net.Jsonp.prototype.setRequestTimeout = function(timeout) { 
  this.timeout_ = timeout; 
}; 
goog.net.Jsonp.prototype.getRequestTimeout = function() { 
  return this.timeout_; 
}; 
goog.net.Jsonp.prototype.send = function(opt_payload, opt_replyCallback, opt_errorCallback, opt_callbackParamValue) { 
  var payload = opt_payload || null; 
  if(! document.documentElement.firstChild) { 
    if(opt_errorCallback) { 
      opt_errorCallback(payload); 
    } 
    return null; 
  } 
  var id = opt_callbackParamValue || '_' +(goog.net.Jsonp.scriptCounter_ ++).toString(36) + goog.now().toString(36); 
  if(! goog.global[goog.net.Jsonp.CALLBACKS]) { 
    goog.global[goog.net.Jsonp.CALLBACKS]= { }; 
  } 
  var script = goog.dom.createElement('script'); 
  var timeout = null; 
  if(this.timeout_ > 0) { 
    var error = goog.net.Jsonp.newErrorHandler_(id, script, payload, opt_errorCallback); 
    timeout = goog.global.setTimeout(error, this.timeout_); 
  } 
  var uri = this.uri_.clone(); 
  if(payload) { 
    goog.net.Jsonp.addPayloadToUri_(payload, uri); 
  } 
  if(opt_replyCallback) { 
    var reply = goog.net.Jsonp.newReplyHandler_(id, script, opt_replyCallback, timeout); 
    goog.global[goog.net.Jsonp.CALLBACKS][id]= reply; 
    uri.setParameterValues(this.callbackParamName_, goog.net.Jsonp.CALLBACKS + '.' + id); 
  } 
  goog.dom.setProperties(script, { 
    'type': 'text/javascript', 
    'id': id, 
    'charset': 'UTF-8', 
    'src': uri.toString() 
  }); 
  goog.dom.appendChild(document.getElementsByTagName('head')[0], script); 
  return { 
    id_: id, 
    timeout_: timeout 
  }; 
}; 
goog.net.Jsonp.prototype.cancel = function(request) { 
  if(request && request.id_) { 
    var scriptNode = goog.dom.getElement(request.id_); 
    if(scriptNode && scriptNode.tagName == 'SCRIPT' && typeof goog.global[goog.net.Jsonp.CALLBACKS][request.id_]== 'function') { 
      request.timeout_ && goog.global.clearTimeout(request.timeout_); 
      goog.net.Jsonp.cleanup_(request.id_, scriptNode, false); 
    } 
  } 
}; 
goog.net.Jsonp.newErrorHandler_ = function(id, scriptNode, payload, opt_errorCallback) { 
  return function() { 
    goog.net.Jsonp.cleanup_(id, scriptNode, false); 
    if(opt_errorCallback) { 
      opt_errorCallback(payload); 
    } 
  }; 
}; 
goog.net.Jsonp.newReplyHandler_ = function(id, scriptNode, replyCallback, timeout) { 
  return function(var_args) { 
    goog.global.clearTimeout(timeout); 
    goog.net.Jsonp.cleanup_(id, scriptNode, true); 
    replyCallback.apply(undefined, arguments); 
  }; 
}; 
goog.net.Jsonp.cleanup_ = function(id, scriptNode, deleteReplyHandler) { 
  goog.global.setTimeout(function() { 
    goog.dom.removeNode(scriptNode); 
  }, 0); 
  if(goog.global[goog.net.Jsonp.CALLBACKS][id]) { 
    if(deleteReplyHandler) { 
      delete goog.global[goog.net.Jsonp.CALLBACKS][id]; 
    } else { 
      goog.global[goog.net.Jsonp.CALLBACKS][id]= goog.nullFunction; 
    } 
  } 
}; 
goog.net.Jsonp.addPayloadToUri_ = function(payload, uri) { 
  for(var name in payload) { 
    if(! payload.hasOwnProperty || payload.hasOwnProperty(name)) { 
      uri.setParameterValues(name, payload[name]); 
    } 
  } 
  return uri; 
}; 

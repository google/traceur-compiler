
goog.provide('goog.messaging.AbstractChannel'); 
goog.require('goog.Disposable'); 
goog.require('goog.debug'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.json'); 
goog.require('goog.messaging.MessageChannel'); 
goog.messaging.AbstractChannel = function() { 
  goog.base(this); 
  this.services_ = { }; 
}; 
goog.inherits(goog.messaging.AbstractChannel, goog.Disposable); 
goog.messaging.AbstractChannel.prototype.defaultService_; 
goog.messaging.AbstractChannel.prototype.logger = goog.debug.Logger.getLogger('goog.messaging.AbstractChannel'); 
goog.messaging.AbstractChannel.prototype.connect = function(opt_connectCb) { 
  if(opt_connectCb) { 
    opt_connectCb(); 
  } 
}; 
goog.messaging.AbstractChannel.prototype.isConnected = function() { 
  return true; 
}; 
goog.messaging.AbstractChannel.prototype.registerService = function(serviceName, callback, opt_objectPayload) { 
  this.services_[serviceName]= { 
    callback: callback, 
    objectPayload: ! ! opt_objectPayload 
  }; 
}; 
goog.messaging.AbstractChannel.prototype.registerDefaultService = function(callback) { 
  this.defaultService_ = callback; 
}; 
goog.messaging.AbstractChannel.prototype.send = goog.abstractMethod; 
goog.messaging.AbstractChannel.prototype.deliver = function(serviceName, payload) { 
  var service = this.getService(serviceName, payload); 
  if(! service) { 
    return; 
  } 
  payload = this.decodePayload(serviceName, payload, service.objectPayload); 
  if(goog.isDefAndNotNull(payload)) { 
    service.callback(payload); 
  } 
}; 
goog.messaging.AbstractChannel.prototype.getService = function(serviceName, payload) { 
  var service = this.services_[serviceName]; 
  if(service) { 
    return service; 
  } else if(this.defaultService_) { 
    var callback = goog.partial(this.defaultService_, serviceName); 
    var objectPayload = goog.isObject(payload); 
    return { 
      callback: callback, 
      objectPayload: objectPayload 
    }; 
  } 
  this.logger.warning('Unknown service name "' + serviceName + '"'); 
  return null; 
}; 
goog.messaging.AbstractChannel.prototype.decodePayload = function(serviceName, payload, objectPayload) { 
  if(objectPayload && goog.isString(payload)) { 
    try { 
      return goog.json.parse(payload); 
    } catch(err) { 
      this.logger.warning('Expected JSON payload for ' + serviceName + ', was "' + payload + '"'); 
      return null; 
    } 
  } else if(! objectPayload && ! goog.isString(payload)) { 
    return goog.json.serialize(payload); 
  } 
  return payload; 
}; 
goog.messaging.AbstractChannel.prototype.disposeInternal = function() { 
  goog.base(this, 'disposeInternal'); 
  goog.dispose(this.logger); 
  delete this.logger; 
  delete this.services_; 
  delete this.defaultService_; 
}; 

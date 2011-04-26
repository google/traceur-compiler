
goog.provide('goog.messaging.PortCaller'); 
goog.require('goog.Disposable'); 
goog.require('goog.async.Deferred'); 
goog.require('goog.messaging.DeferredChannel'); 
goog.require('goog.messaging.PortChannel'); 
goog.require('goog.messaging.PortNetwork'); 
goog.require('goog.object'); 
goog.messaging.PortCaller = function(operatorPort) { 
  goog.base(this); 
  this.operatorPort_ = operatorPort; 
  this.connections_ = { }; 
  this.operatorPort_.registerService(goog.messaging.PortNetwork.GRANT_CONNECTION_SERVICE, goog.bind(this.connectionGranted_, this), true); 
}; 
goog.inherits(goog.messaging.PortCaller, goog.Disposable); 
goog.messaging.PortCaller.prototype.dial = function(name) { 
  if(name in this.connections_) { 
    return this.connections_[name].channel; 
  } 
  this.operatorPort_.send(goog.messaging.PortNetwork.REQUEST_CONNECTION_SERVICE, name); 
  var deferred = new goog.async.Deferred(); 
  var channel = new goog.messaging.DeferredChannel(deferred); 
  this.connections_[name]= { 
    deferred: deferred, 
    channel: channel 
  }; 
  return channel; 
}; 
goog.messaging.PortCaller.prototype.connectionGranted_ = function(args) { 
  var port = args['port']; 
  var entry = this.connections_[args['name']]; 
  if(entry &&(! entry.deferred || entry.deferred.hasFired())) { 
    port.close(); 
  } else if(! args['success']) { 
    throw Error(args['message']); 
  } else { 
    port.start(); 
    var channel = new goog.messaging.PortChannel(port); 
    if(entry) { 
      entry.deferred.callback(channel); 
    } else { 
      this.connections_[args['name']]= { 
        channel: channel, 
        deferred: null 
      }; 
    } 
  } 
}; 
goog.messaging.PortCaller.prototype.disposeInternal = function() { 
  goog.dispose(this.operatorPort_); 
  goog.object.forEach(this.connections_, goog.dispose); 
  delete this.operatorPort_; 
  delete this.connections_; 
  goog.base(this, 'disposeInternal'); 
}; 

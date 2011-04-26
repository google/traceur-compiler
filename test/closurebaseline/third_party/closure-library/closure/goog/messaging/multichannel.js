
goog.provide('goog.messaging.MultiChannel'); 
goog.provide('goog.messaging.MultiChannel.VirtualChannel'); 
goog.require('goog.Disposable'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.messaging.MessageChannel'); 
goog.require('goog.object'); 
goog.messaging.MultiChannel = function(underlyingChannel) { 
  goog.base(this); 
  this.underlyingChannel_ = underlyingChannel; 
  this.virtualChannels_ = { }; 
  this.underlyingChannel_.registerDefaultService(goog.bind(this.handleDefault_, this)); 
}; 
goog.inherits(goog.messaging.MultiChannel, goog.Disposable); 
goog.messaging.MultiChannel.prototype.logger_ = goog.debug.Logger.getLogger('goog.messaging.MultiChannel'); 
goog.messaging.MultiChannel.prototype.createVirtualChannel = function(name) { 
  if(name.indexOf(':') != - 1) { 
    throw Error('Virtual channel name "' + name + '" should not contain colons'); 
  } 
  if(name in this.virtualChannels_) { 
    throw Error('Virtual channel "' + name + '" was already created for ' + 'this multichannel.'); 
  } 
  var channel = new goog.messaging.MultiChannel.VirtualChannel(this, name); 
  this.virtualChannels_[name]= channel; 
  return channel; 
}; 
goog.messaging.MultiChannel.prototype.handleDefault_ = function(serviceName, payload) { 
  var match = serviceName.match(/^([^:]*):(.*)/); 
  if(! match) { 
    this.logger_.warning('Invalid service name "' + serviceName + '": no ' + 'virtual channel specified'); 
    return; 
  } 
  var channelName = match[1]; 
  serviceName = match[2]; 
  if(!(channelName in this.virtualChannels_)) { 
    this.logger_.warning('Virtual channel "' + channelName + ' does not ' + 'exist, but a message was received for it: "' + serviceName + '"'); 
    return; 
  } 
  var virtualChannel = this.virtualChannels_[channelName]; 
  if(! virtualChannel) { 
    this.logger_.warning('Virtual channel "' + channelName + ' has been ' + 'disposed, but a message was received for it: "' + serviceName + '"'); 
    return; 
  } 
  if(! virtualChannel.defaultService_) { 
    this.logger_.warning('Service "' + serviceName + '" is not registered ' + 'on virtual channel "' + channelName + '"'); 
    return; 
  } 
  virtualChannel.defaultService_(serviceName, payload); 
}; 
goog.messaging.MultiChannel.prototype.disposeInternal = function() { 
  goog.object.forEach(this.virtualChannels_, function(channel) { 
    goog.dispose(channel); 
  }); 
  goog.dispose(this.underlyingChannel_); 
  delete this.virtualChannels_; 
  delete this.underlyingChannel_; 
}; 
goog.messaging.MultiChannel.VirtualChannel = function(parent, name) { 
  goog.base(this); 
  this.parent_ = parent; 
  this.name_ = name; 
}; 
goog.inherits(goog.messaging.MultiChannel.VirtualChannel, goog.Disposable); 
goog.messaging.MultiChannel.VirtualChannel.prototype.defaultService_; 
goog.messaging.MultiChannel.VirtualChannel.prototype.logger_ = goog.debug.Logger.getLogger('goog.messaging.MultiChannel.VirtualChannel'); 
goog.messaging.MultiChannel.VirtualChannel.prototype.connect = function(opt_connectCb) { 
  if(opt_connectCb) { 
    opt_connectCb(); 
  } 
}; 
goog.messaging.MultiChannel.VirtualChannel.prototype.isConnected = function() { 
  return true; 
}; 
goog.messaging.MultiChannel.VirtualChannel.prototype.registerService = function(serviceName, callback, opt_objectPayload) { 
  this.parent_.underlyingChannel_.registerService(this.name_ + ':' + serviceName, goog.bind(this.doCallback_, this, callback), opt_objectPayload); 
}; 
goog.messaging.MultiChannel.VirtualChannel.prototype.registerDefaultService = function(callback) { 
  this.defaultService_ = goog.bind(this.doCallback_, this, callback); 
}; 
goog.messaging.MultiChannel.VirtualChannel.prototype.send = function(serviceName, payload) { 
  if(this.isDisposed()) { 
    throw Error('#send called for disposed VirtualChannel.'); 
  } 
  this.parent_.underlyingChannel_.send(this.name_ + ':' + serviceName, payload); 
}; 
goog.messaging.MultiChannel.VirtualChannel.prototype.doCallback_ = function(callback, var_args) { 
  if(this.isDisposed()) { 
    this.logger_.warning('Virtual channel "' + this.name_ + '" received ' + ' a message after being disposed.'); 
    return; 
  } 
  callback.apply({ }, Array.prototype.slice.call(arguments, 1)); 
}; 
goog.messaging.MultiChannel.VirtualChannel.prototype.disposeInternal = function() { 
  this.parent_.virtualChannels_[this.name_]= null; 
  this.parent_ = null; 
}; 

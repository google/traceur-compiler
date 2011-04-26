
goog.provide('goog.messaging.BufferedChannel'); 
goog.require('goog.Timer'); 
goog.require('goog.Uri'); 
goog.require('goog.debug.Error'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.events'); 
goog.require('goog.messaging.MessageChannel'); 
goog.require('goog.messaging.MultiChannel'); 
goog.messaging.BufferedChannel = function(messageChannel, opt_interval) { 
  goog.Disposable.call(this); 
  this.buffer_ =[]; 
  this.multiChannel_ = new goog.messaging.MultiChannel(messageChannel); 
  this.userChannel_ = this.multiChannel_.createVirtualChannel(goog.messaging.BufferedChannel.USER_CHANNEL_NAME_); 
  this.controlChannel_ = this.multiChannel_.createVirtualChannel(goog.messaging.BufferedChannel.CONTROL_CHANNEL_NAME_); 
  this.timer_ = new goog.Timer(opt_interval || goog.messaging.BufferedChannel.DEFAULT_INTERVAL_MILLIS_); 
  this.timer_.start(); 
  goog.events.listen(this.timer_, goog.Timer.TICK, this.onTick_, false, this); 
  this.controlChannel_.registerService(goog.messaging.BufferedChannel.PEER_READY_SERVICE_NAME_, goog.bind(this.setPeerReady_, this)); 
}; 
goog.inherits(goog.messaging.BufferedChannel, goog.Disposable); 
goog.messaging.BufferedChannel.DEFAULT_INTERVAL_MILLIS_ = 50; 
goog.messaging.BufferedChannel.PEER_READY_SERVICE_NAME_ = 'setPeerReady_'; 
goog.messaging.BufferedChannel.USER_CHANNEL_NAME_ = 'user'; 
goog.messaging.BufferedChannel.CONTROL_CHANNEL_NAME_ = 'control'; 
goog.messaging.BufferedChannel.prototype.connect = function(opt_connectCb) { 
  if(opt_connectCb) { 
    opt_connectCb(); 
  } 
}; 
goog.messaging.BufferedChannel.prototype.isConnected = function() { 
  return true; 
}; 
goog.messaging.BufferedChannel.prototype.isPeerReady = function() { 
  return this.peerReady_; 
}; 
goog.messaging.BufferedChannel.prototype.logger_ = goog.debug.Logger.getLogger('goog.messaging.bufferedchannel'); 
goog.messaging.BufferedChannel.prototype.onTick_ = function(unusedEvent) { 
  try { 
    this.controlChannel_.send(goog.messaging.BufferedChannel.PEER_READY_SERVICE_NAME_, ''); 
  } catch(e) { 
    this.timer_.stop(); 
    throw e; 
  } 
  if(this.isPeerReady()) { 
    this.timer_.stop(); 
  } 
}; 
goog.messaging.BufferedChannel.prototype.peerReady_; 
goog.messaging.BufferedChannel.prototype.registerService = function(serviceName, callback, opt_objectPayload) { 
  this.userChannel_.registerService(serviceName, callback, opt_objectPayload); 
}; 
goog.messaging.BufferedChannel.prototype.registerDefaultService = function(callback) { 
  this.userChannel_.registerDefaultService(callback); 
}; 
goog.messaging.BufferedChannel.prototype.send = function(serviceName, payload) { 
  if(this.isPeerReady()) { 
    this.userChannel_.send(serviceName, payload); 
  } else { 
    goog.messaging.BufferedChannel.prototype.logger_.fine('buffering message ' + serviceName); 
    this.buffer_.push({ 
      serviceName: serviceName, 
      payload: payload 
    }); 
  } 
}; 
goog.messaging.BufferedChannel.prototype.setPeerReady_ = function() { 
  if(this.peerReady_) { 
    return; 
  } 
  this.peerReady_ = true; 
  for(var i = 0; i < this.buffer_.length; i ++) { 
    var message = this.buffer_[i]; 
    goog.messaging.BufferedChannel.prototype.logger_.fine('sending buffered message ' + message.serviceName); 
    this.userChannel_.send(message.serviceName, message.payload); 
  } 
  this.buffer_ = null; 
}; 
goog.messaging.BufferedChannel.prototype.disposeInternal = function() { 
  goog.dispose(this.multiChannel_); 
  goog.dispose(this.timer_); 
  goog.base(this, 'disposeInternal'); 
}; 

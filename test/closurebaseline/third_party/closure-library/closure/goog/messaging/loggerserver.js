
goog.provide('goog.messaging.LoggerServer'); 
goog.require('goog.Disposable'); 
goog.require('goog.debug.Logger'); 
goog.messaging.LoggerServer = function(channel, serviceName, opt_channelName) { 
  goog.base(this); 
  this.channel_ = channel; 
  this.serviceName_ = serviceName; 
  this.channelName_ = opt_channelName || 'remote logger'; 
  this.channel_.registerService(this.serviceName_, goog.bind(this.log_, this), true); 
}; 
goog.inherits(goog.messaging.LoggerServer, goog.Disposable); 
goog.messaging.LoggerServer.prototype.log_ = function(args) { 
  var level = goog.debug.Logger.Level.getPredefinedLevelByValue(args['level']); 
  if(level) { 
    var msg = '[' + this.channelName_ + '] ' + args['message']; 
    goog.debug.Logger.getLogger(args['name']).log(level, msg, args['exception']); 
  } 
}; 
goog.messaging.LoggerServer.prototype.disposeInternal = function() { 
  goog.base(this, 'disposeInternal'); 
  this.channel_.registerService(this.serviceName_, goog.nullFunction, true); 
  delete this.channel_; 
}; 

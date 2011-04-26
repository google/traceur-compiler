
goog.provide('goog.messaging.PortOperator'); 
goog.require('goog.Disposable'); 
goog.require('goog.asserts'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.messaging.PortChannel'); 
goog.require('goog.messaging.PortNetwork'); 
goog.require('goog.object'); 
goog.messaging.PortOperator = function(name) { 
  goog.base(this); 
  this.connections_ = { }; 
  this.switchboard_ = { }; 
  this.name_ = name; 
}; 
goog.inherits(goog.messaging.PortOperator, goog.Disposable); 
goog.messaging.PortOperator.prototype.logger_ = goog.debug.Logger.getLogger('goog.messaging.PortOperator'); 
goog.messaging.PortOperator.prototype.dial = function(name) { 
  this.connectSelfToPort_(name); 
  return this.connections_[name]; 
}; 
goog.messaging.PortOperator.prototype.addPort = function(name, port) { 
  this.switchboard_[name]= port; 
  port.registerService(goog.messaging.PortNetwork.REQUEST_CONNECTION_SERVICE, goog.bind(this.requestConnection_, this, name)); 
}; 
goog.messaging.PortOperator.prototype.requestConnection_ = function(sourceName, requestedName) { 
  if(requestedName == this.name_) { 
    this.connectSelfToPort_(sourceName); 
    return; 
  } 
  var sourceChannel = this.switchboard_[sourceName]; 
  var requestedChannel = this.switchboard_[requestedName]; 
  goog.asserts.assert(goog.isDefAndNotNull(sourceChannel)); 
  if(! requestedChannel) { 
    var err = 'Port "' + sourceName + '" requested a connection to port "' + requestedName + '", which doesn\'t exist'; 
    this.logger_.warning(err); 
    sourceChannel.send(goog.messaging.PortNetwork.GRANT_CONNECTION_SERVICE, { 
      'success': false, 
      'message': err 
    }); 
    return; 
  } 
  var messageChannel = new MessageChannel(); 
  sourceChannel.send(goog.messaging.PortNetwork.GRANT_CONNECTION_SERVICE, { 
    'success': true, 
    'name': requestedName, 
    'port': messageChannel.port1 
  }); 
  requestedChannel.send(goog.messaging.PortNetwork.GRANT_CONNECTION_SERVICE, { 
    'success': true, 
    'name': sourceName, 
    'port': messageChannel.port2 
  }); 
}; 
goog.messaging.PortOperator.prototype.connectSelfToPort_ = function(contextName) { 
  if(contextName in this.connections_) { 
    return; 
  } 
  var contextChannel = this.switchboard_[contextName]; 
  if(! contextChannel) { 
    throw Error('Port "' + contextName + '" doesn\'t exist'); 
  } 
  var messageChannel = new MessageChannel(); 
  contextChannel.send(goog.messaging.PortNetwork.GRANT_CONNECTION_SERVICE, { 
    'success': true, 
    'name': this.name_, 
    'port': messageChannel.port1 
  }); 
  messageChannel.port2.start(); 
  this.connections_[contextName]= new goog.messaging.PortChannel(messageChannel.port2); 
}; 
goog.messaging.PortOperator.prototype.disposeInternal = function() { 
  goog.object.forEach(this.switchboard_, goog.dispose); 
  goog.object.forEach(this.connections_, goog.dispose); 
  delete this.switchboard_; 
  delete this.connections_; 
  goog.base(this, 'disposeInternal'); 
}; 

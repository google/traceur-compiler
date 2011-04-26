
goog.provide('goog.gears.WorkerChannel'); 
goog.require('goog.Disposable'); 
goog.require('goog.debug'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.events'); 
goog.require('goog.gears.Worker'); 
goog.require('goog.gears.Worker.EventType'); 
goog.require('goog.gears.WorkerEvent'); 
goog.require('goog.json'); 
goog.require('goog.messaging.AbstractChannel'); 
goog.gears.WorkerChannel = function(worker) { 
  goog.base(this); 
  this.worker_ = worker; 
  goog.events.listen(this.worker_, goog.gears.Worker.EventType.MESSAGE, this.deliver_, false, this); 
}; 
goog.inherits(goog.gears.WorkerChannel, goog.messaging.AbstractChannel); 
goog.gears.WorkerChannel.FLAG = '--goog.gears.WorkerChannel'; 
goog.gears.WorkerChannel.prototype.peerOrigin; 
goog.gears.WorkerChannel.prototype.logger = goog.debug.Logger.getLogger('goog.gears.WorkerChannel'); 
goog.gears.WorkerChannel.prototype.send = function(serviceName, payload) { 
  var message = { 
    'serviceName': serviceName, 
    'payload': payload 
  }; 
  message[goog.gears.WorkerChannel.FLAG]= true; 
  this.worker_.sendMessage(message); 
}; 
goog.gears.WorkerChannel.prototype.disposeInternal = function() { 
  goog.base(this, 'disposeInternal'); 
  this.worker_.dispose(); 
}; 
goog.gears.WorkerChannel.prototype.deliver_ = function(e) { 
  var messageObject = e.messageObject || { }; 
  var body = messageObject.body; 
  if(! goog.isObject(body) || ! body[goog.gears.WorkerChannel.FLAG]) { 
    return; 
  } 
  if(! this.checkMessageOrigin(messageObject.origin)) { 
    return; 
  } 
  if(this.validateMessage_(body)) { 
    this.deliver(body['serviceName'], body['payload']); 
  } 
  e.preventDefault(); 
  e.stopPropagation(); 
}; 
goog.gears.WorkerChannel.prototype.validateMessage_ = function(body) { 
  if(!('serviceName' in body)) { 
    this.logger.warning('GearsWorkerChannel::deliver_(): ' + 'Message object doesn\'t contain service name: ' + goog.debug.deepExpose(body)); 
    return false; 
  } 
  if(!('payload' in body)) { 
    this.logger.warning('GearsWorkerChannel::deliver_(): ' + 'Message object doesn\'t contain payload: ' + goog.debug.deepExpose(body)); 
    return false; 
  } 
  return true; 
}; 
goog.gears.WorkerChannel.prototype.checkMessageOrigin = function(messageOrigin) { 
  if(! this.peerOrigin) { 
    return true; 
  } 
  var peerOrigin = this.peerOrigin; 
  if(/^http:/.test(peerOrigin)) { 
    peerOrigin = peerOrigin.replace(/\:80$/, ''); 
  } else if(/^https:/.test(peerOrigin)) { 
    peerOrigin = peerOrigin.replace(/\:443$/, ''); 
  } 
  if(messageOrigin === peerOrigin) { 
    return true; 
  } 
  this.logger.warning('Message from unexpected origin "' + messageOrigin + '"; expected only messages from origin "' + peerOrigin + '"'); 
  return false; 
}; 


goog.provide('goog.net.xpc.NativeMessagingTransport'); 
goog.require('goog.events'); 
goog.require('goog.net.xpc'); 
goog.require('goog.net.xpc.Transport'); 
goog.net.xpc.NativeMessagingTransport = function(channel, peerHostname, opt_domHelper) { 
  goog.base(this, opt_domHelper); 
  this.channel_ = channel; 
  this.peerHostname_ = peerHostname || '*'; 
}; 
goog.inherits(goog.net.xpc.NativeMessagingTransport, goog.net.xpc.Transport); 
goog.net.xpc.NativeMessagingTransport.prototype.initialized_ = false; 
goog.net.xpc.NativeMessagingTransport.prototype.transportType = goog.net.xpc.TransportTypes.NATIVE_MESSAGING; 
goog.net.xpc.NativeMessagingTransport.activeCount_ = { }; 
goog.net.xpc.NativeMessagingTransport.initialize_ = function(listenWindow) { 
  var uid = goog.getUid(listenWindow); 
  var value = goog.net.xpc.NativeMessagingTransport.activeCount_[uid]; 
  if(! goog.isNumber(value)) { 
    value = 0; 
  } 
  if(value == 0) { 
    goog.events.listen(listenWindow.postMessage ? listenWindow: listenWindow.document, 'message', goog.net.xpc.NativeMessagingTransport.messageReceived_, false, goog.net.xpc.NativeMessagingTransport); 
  } 
  goog.net.xpc.NativeMessagingTransport.activeCount_[uid]= value + 1; 
}; 
goog.net.xpc.NativeMessagingTransport.messageReceived_ = function(msgEvt) { 
  var data = msgEvt.getBrowserEvent().data; 
  var headDelim = data.indexOf('|'); 
  var serviceDelim = data.indexOf(':'); 
  if(headDelim == - 1 || serviceDelim == - 1) { 
    return false; 
  } 
  var channelName = data.substring(0, headDelim); 
  var service = data.substring(headDelim + 1, serviceDelim); 
  var payload = data.substring(serviceDelim + 1); 
  goog.net.xpc.logger.fine('messageReceived: channel=' + channelName + ', service=' + service + ', payload=' + payload); 
  var channel = goog.net.xpc.channels_[channelName]; 
  if(channel) { 
    channel.deliver_(service, payload, msgEvt.getBrowserEvent().origin); 
    return true; 
  } 
  for(var staleChannelName in goog.net.xpc.channels_) { 
    var staleChannel = goog.net.xpc.channels_[staleChannelName]; 
    if(staleChannel.getRole() == goog.net.xpc.CrossPageChannel.Role.INNER && ! staleChannel.isConnected() && service == goog.net.xpc.TRANSPORT_SERVICE_ && payload == goog.net.xpc.SETUP) { 
      goog.net.xpc.logger.fine('changing channel name to ' + channelName); 
      staleChannel.name = channelName; 
      delete goog.net.xpc.channels_[staleChannelName]; 
      goog.net.xpc.channels_[channelName]= staleChannel; 
      staleChannel.deliver_(service, payload); 
      return true; 
    } 
  } 
  goog.net.xpc.logger.info('channel name mismatch; message ignored"'); 
  return false; 
}; 
goog.net.xpc.NativeMessagingTransport.prototype.transportServiceHandler = function(payload) { 
  switch(payload) { 
    case goog.net.xpc.SETUP: 
      this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP_ACK_); 
      break; 

    case goog.net.xpc.SETUP_ACK_: 
      this.channel_.notifyConnected_(); 
      break; 

  } 
}; 
goog.net.xpc.NativeMessagingTransport.prototype.connect = function() { 
  goog.net.xpc.NativeMessagingTransport.initialize_(this.getWindow()); 
  this.initialized_ = true; 
  this.connectWithRetries_(); 
}; 
goog.net.xpc.NativeMessagingTransport.prototype.connectWithRetries_ = function() { 
  if(this.channel_.isConnected() || this.isDisposed()) { 
    return; 
  } 
  this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP); 
  this.getWindow().setTimeout(goog.bind(this.connectWithRetries_, this), 100); 
}; 
goog.net.xpc.NativeMessagingTransport.prototype.send = function(service, payload) { 
  var win = this.channel_.peerWindowObject_; 
  if(! win) { 
    goog.net.xpc.logger.fine('send(): window not ready'); 
    return; 
  } 
  var obj = win.postMessage ? win: win.document; 
  this.send = function(service, payload) { 
    goog.net.xpc.logger.fine('send(): payload=' + payload + ' to hostname=' + this.peerHostname_); 
    obj.postMessage(this.channel_.name + '|' + service + ':' + payload, this.peerHostname_); 
  }; 
  this.send(service, payload); 
}; 
goog.net.xpc.NativeMessagingTransport.prototype.disposeInternal = function() { 
  goog.base(this, 'disposeInternal'); 
  if(this.initialized_) { 
    var listenWindow = this.getWindow(); 
    var uid = goog.getUid(listenWindow); 
    var value = goog.net.xpc.NativeMessagingTransport.activeCount_[uid]; 
    goog.net.xpc.NativeMessagingTransport.activeCount_[uid]= value - 1; 
    if(value == 1) { 
      goog.events.unlisten(listenWindow.postMessage ? listenWindow: listenWindow.document, 'message', goog.net.xpc.NativeMessagingTransport.messageReceived_, false, goog.net.xpc.NativeMessagingTransport); 
    } 
  } 
}; 

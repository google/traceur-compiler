
goog.provide('goog.net.xpc.FrameElementMethodTransport'); 
goog.require('goog.net.xpc'); 
goog.require('goog.net.xpc.Transport'); 
goog.net.xpc.FrameElementMethodTransport = function(channel, opt_domHelper) { 
  goog.base(this, opt_domHelper); 
  this.channel_ = channel; 
  this.queue_ =[]; 
  this.deliverQueuedCb_ = goog.bind(this.deliverQueued_, this); 
}; 
goog.inherits(goog.net.xpc.FrameElementMethodTransport, goog.net.xpc.Transport); 
goog.net.xpc.FrameElementMethodTransport.prototype.transportType = goog.net.xpc.TransportTypes.FRAME_ELEMENT_METHOD; 
goog.net.xpc.FrameElementMethodTransport.prototype.recursive_ = false; 
goog.net.xpc.FrameElementMethodTransport.prototype.timer_ = 0; 
goog.net.xpc.FrameElementMethodTransport.outgoing_ = null; 
goog.net.xpc.FrameElementMethodTransport.prototype.connect = function() { 
  if(this.channel_.getRole() == goog.net.xpc.CrossPageChannel.Role.OUTER) { 
    this.iframeElm_ = this.channel_.iframeElement_; 
    this.iframeElm_['XPC_toOuter']= goog.bind(this.incoming_, this); 
  } else { 
    this.attemptSetup_(); 
  } 
}; 
goog.net.xpc.FrameElementMethodTransport.prototype.attemptSetup_ = function() { 
  var retry = true; 
  try { 
    if(! this.iframeElm_) { 
      this.iframeElm_ = this.getWindow().frameElement; 
    } 
    if(this.iframeElm_ && this.iframeElm_['XPC_toOuter']) { 
      this.outgoing_ = this.iframeElm_['XPC_toOuter']; 
      this.iframeElm_['XPC_toOuter']['XPC_toInner']= goog.bind(this.incoming_, this); 
      retry = false; 
      this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP_ACK_); 
      this.channel_.notifyConnected_(); 
    } 
  } catch(e) { 
    goog.net.xpc.logger.severe('exception caught while attempting setup: ' + e); 
  } 
  if(retry) { 
    if(! this.attemptSetupCb_) { 
      this.attemptSetupCb_ = goog.bind(this.attemptSetup_, this); 
    } 
    this.getWindow().setTimeout(this.attemptSetupCb_, 100); 
  } 
}; 
goog.net.xpc.FrameElementMethodTransport.prototype.transportServiceHandler = function(payload) { 
  if(this.channel_.getRole() == goog.net.xpc.CrossPageChannel.Role.OUTER && ! this.channel_.isConnected() && payload == goog.net.xpc.SETUP_ACK_) { 
    this.outgoing_ = this.iframeElm_['XPC_toOuter']['XPC_toInner']; 
    this.channel_.notifyConnected_(); 
  } else { 
    throw Error('Got unexpected transport message.'); 
  } 
}; 
goog.net.xpc.FrameElementMethodTransport.prototype.incoming_ = function(serviceName, payload) { 
  if(! this.recursive_ && this.queue_.length == 0) { 
    this.channel_.deliver_(serviceName, payload); 
  } else { 
    this.queue_.push({ 
      serviceName: serviceName, 
      payload: payload 
    }); 
    if(this.queue_.length == 1) { 
      this.timer_ = this.getWindow().setTimeout(this.deliverQueuedCb_, 1); 
    } 
  } 
}; 
goog.net.xpc.FrameElementMethodTransport.prototype.deliverQueued_ = function() { 
  while(this.queue_.length) { 
    var msg = this.queue_.shift(); 
    this.channel_.deliver_(msg.serviceName, msg.payload); 
  } 
}; 
goog.net.xpc.FrameElementMethodTransport.prototype.send = function(service, payload) { 
  this.recursive_ = true; 
  this.outgoing_(service, payload); 
  this.recursive_ = false; 
}; 
goog.net.xpc.FrameElementMethodTransport.prototype.disposeInternal = function() { 
  goog.net.xpc.FrameElementMethodTransport.superClass_.disposeInternal.call(this); 
  this.outgoing_ = null; 
  this.iframeElm_ = null; 
}; 

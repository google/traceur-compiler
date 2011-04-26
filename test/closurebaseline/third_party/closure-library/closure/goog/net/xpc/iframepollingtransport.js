
goog.provide('goog.net.xpc.IframePollingTransport'); 
goog.provide('goog.net.xpc.IframePollingTransport.Receiver'); 
goog.provide('goog.net.xpc.IframePollingTransport.Sender'); 
goog.require('goog.array'); 
goog.require('goog.dom'); 
goog.require('goog.net.xpc'); 
goog.require('goog.net.xpc.Transport'); 
goog.require('goog.userAgent'); 
goog.net.xpc.IframePollingTransport = function(channel, opt_domHelper) { 
  goog.base(this, opt_domHelper); 
  this.channel_ = channel; 
  this.sendUri_ = this.channel_.cfg_[goog.net.xpc.CfgFields.PEER_POLL_URI]; 
  this.rcvUri_ = this.channel_.cfg_[goog.net.xpc.CfgFields.LOCAL_POLL_URI]; 
  this.sendQueue_ =[]; 
}; 
goog.inherits(goog.net.xpc.IframePollingTransport, goog.net.xpc.Transport); 
goog.net.xpc.IframePollingTransport.prototype.transportType = goog.net.xpc.TransportTypes.IFRAME_POLLING; 
goog.net.xpc.IframePollingTransport.prototype.sequence_ = 0; 
goog.net.xpc.IframePollingTransport.prototype.waitForAck_ = false; 
goog.net.xpc.IframePollingTransport.prototype.initialized_ = false; 
goog.net.xpc.IframePollingTransport.IFRAME_PREFIX = 'googlexpc'; 
goog.net.xpc.IframePollingTransport.prototype.getMsgFrameName_ = function() { 
  return goog.net.xpc.IframePollingTransport.IFRAME_PREFIX + '_' + this.channel_.name + '_msg'; 
}; 
goog.net.xpc.IframePollingTransport.prototype.getAckFrameName_ = function() { 
  return goog.net.xpc.IframePollingTransport.IFRAME_PREFIX + '_' + this.channel_.name + '_ack'; 
}; 
goog.net.xpc.IframePollingTransport.prototype.connect = function() { 
  goog.net.xpc.logger.fine('transport connect called'); 
  if(! this.initialized_) { 
    goog.net.xpc.logger.fine('initializing...'); 
    this.constructSenderFrames_(); 
    this.initialized_ = true; 
  } 
  this.checkForeignFramesReady_(); 
}; 
goog.net.xpc.IframePollingTransport.prototype.constructSenderFrames_ = function() { 
  var name = this.getMsgFrameName_(); 
  this.msgIframeElm_ = this.constructSenderFrame_(name); 
  this.msgWinObj_ = this.getWindow().frames[name]; 
  name = this.getAckFrameName_(); 
  this.ackIframeElm_ = this.constructSenderFrame_(name); 
  this.ackWinObj_ = this.getWindow().frames[name]; 
}; 
goog.net.xpc.IframePollingTransport.prototype.constructSenderFrame_ = function(id) { 
  goog.net.xpc.logger.finest('constructing sender frame: ' + id); 
  var ifr = goog.dom.createElement('iframe'); 
  var s = ifr.style; 
  s.position = 'absolute'; 
  s.top = '-10px'; 
  s.left = '10px'; 
  s.width = '1px'; 
  s.height = '1px'; 
  ifr.id = ifr.name = id; 
  ifr.src = this.sendUri_ + '#INITIAL'; 
  this.getWindow().document.body.appendChild(ifr); 
  return ifr; 
}; 
goog.net.xpc.IframePollingTransport.prototype.innerPeerReconnect_ = function() { 
  goog.net.xpc.logger.finest('innerPeerReconnect called'); 
  this.channel_.name = goog.net.xpc.getRandomString(10); 
  goog.net.xpc.logger.finest('switching channels: ' + this.channel_.name); 
  this.deconstructSenderFrames_(); 
  this.initialized_ = false; 
  this.reconnectFrame_ = this.constructSenderFrame_(goog.net.xpc.IframePollingTransport.IFRAME_PREFIX + '_reconnect_' + this.channel_.name); 
}; 
goog.net.xpc.IframePollingTransport.prototype.outerPeerReconnect_ = function() { 
  goog.net.xpc.logger.finest('outerPeerReconnect called'); 
  var frames = this.channel_.peerWindowObject_.frames; 
  var length = frames.length; 
  for(var i = 0; i < length; i ++) { 
    var frameName; 
    try { 
      if(frames[i]&& frames[i].name) { 
        frameName = frames[i].name; 
      } 
    } catch(e) { } 
    if(! frameName) { 
      continue; 
    } 
    var message = frameName.split('_'); 
    if(message.length == 3 && message[0]== goog.net.xpc.IframePollingTransport.IFRAME_PREFIX && message[1]== 'reconnect') { 
      this.channel_.name = message[2]; 
      this.deconstructSenderFrames_(); 
      this.initialized_ = false; 
      break; 
    } 
  } 
}; 
goog.net.xpc.IframePollingTransport.prototype.deconstructSenderFrames_ = function() { 
  goog.net.xpc.logger.finest('deconstructSenderFrames called'); 
  if(this.msgIframeElm_) { 
    this.msgIframeElm_.parentNode.removeChild(this.msgIframeElm_); 
    this.msgIframeElm_ = null; 
    this.msgWinObj_ = null; 
  } 
  if(this.ackIframeElm_) { 
    this.ackIframeElm_.parentNode.removeChild(this.ackIframeElm_); 
    this.ackIframeElm_ = null; 
    this.ackWinObj_ = null; 
  } 
}; 
goog.net.xpc.IframePollingTransport.prototype.checkForeignFramesReady_ = function() { 
  if(!(this.isRcvFrameReady_(this.getMsgFrameName_()) && this.isRcvFrameReady_(this.getAckFrameName_()))) { 
    goog.net.xpc.logger.finest('foreign frames not (yet) present'); 
    if(this.channel_.getRole() == goog.net.xpc.CrossPageChannel.Role.INNER && ! this.reconnectFrame_) { 
      this.innerPeerReconnect_(); 
    } else if(this.channel_.getRole() == goog.net.xpc.CrossPageChannel.Role.OUTER) { 
      this.outerPeerReconnect_(); 
    } 
    this.getWindow().setTimeout(goog.bind(this.connect, this), 100); 
  } else { 
    goog.net.xpc.logger.fine('foreign frames present'); 
    this.msgReceiver_ = new goog.net.xpc.IframePollingTransport.Receiver(this, this.channel_.peerWindowObject_.frames[this.getMsgFrameName_()], goog.bind(this.processIncomingMsg, this)); 
    this.ackReceiver_ = new goog.net.xpc.IframePollingTransport.Receiver(this, this.channel_.peerWindowObject_.frames[this.getAckFrameName_()], goog.bind(this.processIncomingAck, this)); 
    this.checkLocalFramesPresent_(); 
  } 
}; 
goog.net.xpc.IframePollingTransport.prototype.isRcvFrameReady_ = function(frameName) { 
  goog.net.xpc.logger.finest('checking for receive frame: ' + frameName); 
  try { 
    var winObj = this.channel_.peerWindowObject_.frames[frameName]; 
    if(! winObj || winObj.location.href.indexOf(this.rcvUri_) != 0) { 
      return false; 
    } 
  } catch(e) { 
    return false; 
  } 
  return true; 
}; 
goog.net.xpc.IframePollingTransport.prototype.checkLocalFramesPresent_ = function() { 
  var frames = this.channel_.peerWindowObject_.frames; 
  if(!(frames[this.getAckFrameName_()]&& frames[this.getMsgFrameName_()])) { 
    if(! this.checkLocalFramesPresentCb_) { 
      this.checkLocalFramesPresentCb_ = goog.bind(this.checkLocalFramesPresent_, this); 
    } 
    this.getWindow().setTimeout(this.checkLocalFramesPresentCb_, 100); 
    goog.net.xpc.logger.fine('local frames not (yet) present'); 
  } else { 
    this.msgSender_ = new goog.net.xpc.IframePollingTransport.Sender(this.sendUri_, this.msgWinObj_); 
    this.ackSender_ = new goog.net.xpc.IframePollingTransport.Sender(this.sendUri_, this.ackWinObj_); 
    goog.net.xpc.logger.fine('local frames ready'); 
    this.getWindow().setTimeout(goog.bind(function() { 
      this.msgSender_.send(goog.net.xpc.SETUP); 
      this.sentConnectionSetup_ = true; 
      this.waitForAck_ = true; 
      goog.net.xpc.logger.fine('SETUP sent'); 
    }, this), 100); 
  } 
}; 
goog.net.xpc.IframePollingTransport.prototype.checkIfConnected_ = function() { 
  if(this.sentConnectionSetupAck_ && this.rcvdConnectionSetupAck_) { 
    this.channel_.notifyConnected_(); 
    if(this.deliveryQueue_) { 
      goog.net.xpc.logger.fine('delivering queued messages ' + '(' + this.deliveryQueue_.length + ')'); 
      for(var i = 0, m; i < this.deliveryQueue_.length; i ++) { 
        m = this.deliveryQueue_[i]; 
        this.channel_.deliver_(m.service, m.payload); 
      } 
      delete this.deliveryQueue_; 
    } 
  } else { 
    goog.net.xpc.logger.finest('checking if connected: ' + 'ack sent:' + this.sentConnectionSetupAck_ + ', ack rcvd: ' + this.rcvdConnectionSetupAck_); 
  } 
}; 
goog.net.xpc.IframePollingTransport.prototype.processIncomingMsg = function(raw) { 
  goog.net.xpc.logger.finest('msg received: ' + raw); 
  if(raw == goog.net.xpc.SETUP) { 
    if(! this.ackSender_) { 
      return; 
    } 
    this.ackSender_.send(goog.net.xpc.SETUP_ACK_); 
    goog.net.xpc.logger.finest('SETUP_ACK sent'); 
    this.sentConnectionSetupAck_ = true; 
    this.checkIfConnected_(); 
  } else if(this.channel_.isConnected() || this.sentConnectionSetupAck_) { 
    var pos = raw.indexOf('|'); 
    var head = raw.substring(0, pos); 
    var frame = raw.substring(pos + 1); 
    pos = head.indexOf(','); 
    if(pos == - 1) { 
      var seq = head; 
      this.ackSender_.send('ACK:' + seq); 
      this.deliverPayload_(frame); 
    } else { 
      var seq = head.substring(0, pos); 
      this.ackSender_.send('ACK:' + seq); 
      var partInfo = head.substring(pos + 1).split('/'); 
      var part0 = parseInt(partInfo[0], 10); 
      var part1 = parseInt(partInfo[1], 10); 
      if(part0 == 1) { 
        this.parts_ =[]; 
      } 
      this.parts_.push(frame); 
      if(part0 == part1) { 
        this.deliverPayload_(this.parts_.join('')); 
        delete this.parts_; 
      } 
    } 
  } else { 
    goog.net.xpc.logger.warning('received msg, but channel is not connected'); 
  } 
}; 
goog.net.xpc.IframePollingTransport.prototype.processIncomingAck = function(msgStr) { 
  goog.net.xpc.logger.finest('ack received: ' + msgStr); 
  if(msgStr == goog.net.xpc.SETUP_ACK_) { 
    this.waitForAck_ = false; 
    this.rcvdConnectionSetupAck_ = true; 
    this.checkIfConnected_(); 
  } else if(this.channel_.isConnected()) { 
    if(! this.waitForAck_) { 
      goog.net.xpc.logger.warning('got unexpected ack'); 
      return; 
    } 
    var seq = parseInt(msgStr.split(':')[1], 10); 
    if(seq == this.sequence_) { 
      this.waitForAck_ = false; 
      this.sendNextFrame_(); 
    } else { 
      goog.net.xpc.logger.warning('got ack with wrong sequence'); 
    } 
  } else { 
    goog.net.xpc.logger.warning('received ack, but channel not connected'); 
  } 
}; 
goog.net.xpc.IframePollingTransport.prototype.sendNextFrame_ = function() { 
  if(this.waitForAck_ || ! this.sendQueue_.length) { 
    return; 
  } 
  var s = this.sendQueue_.shift(); 
  ++ this.sequence_; 
  this.msgSender_.send(this.sequence_ + s); 
  goog.net.xpc.logger.finest('msg sent: ' + this.sequence_ + s); 
  this.waitForAck_ = true; 
}; 
goog.net.xpc.IframePollingTransport.prototype.deliverPayload_ = function(s) { 
  var pos = s.indexOf(':'); 
  var service = s.substr(0, pos); 
  var payload = s.substring(pos + 1); 
  if(! this.channel_.isConnected()) { 
    (this.deliveryQueue_ ||(this.deliveryQueue_ =[])).push({ 
      service: service, 
      payload: payload 
    }); 
    goog.net.xpc.logger.finest('queued delivery'); 
  } else { 
    this.channel_.deliver_(service, payload); 
  } 
}; 
goog.net.xpc.IframePollingTransport.prototype.MAX_FRAME_LENGTH_ = 3800; 
goog.net.xpc.IframePollingTransport.prototype.send = function(service, payload) { 
  var frame = service + ':' + payload; 
  if(! goog.userAgent.IE || payload.length <= this.MAX_FRAME_LENGTH_) { 
    this.sendQueue_.push('|' + frame); 
  } else { 
    var l = payload.length; 
    var num = Math.ceil(l / this.MAX_FRAME_LENGTH_); 
    var pos = 0; 
    var i = 1; 
    while(pos < l) { 
      this.sendQueue_.push(',' + i + '/' + num + '|' + frame.substr(pos, this.MAX_FRAME_LENGTH_)); 
      i ++; 
      pos += this.MAX_FRAME_LENGTH_; 
    } 
  } 
  this.sendNextFrame_(); 
}; 
goog.net.xpc.IframePollingTransport.prototype.disposeInternal = function() { 
  goog.base(this, 'disposeInternal'); 
  var receivers = goog.net.xpc.IframePollingTransport.receivers_; 
  goog.array.remove(receivers, this.msgReceiver_); 
  goog.array.remove(receivers, this.ackReceiver_); 
  this.msgReceiver_ = this.ackReceiver_ = null; 
  goog.dom.removeNode(this.msgIframeElm_); 
  goog.dom.removeNode(this.ackIframeElm_); 
  this.msgIframeElm_ = this.ackIframeElm_ = null; 
  this.msgWinObj_ = this.ackWinObj_ = null; 
}; 
goog.net.xpc.IframePollingTransport.receivers_ =[]; 
goog.net.xpc.IframePollingTransport.TIME_POLL_SHORT_ = 10; 
goog.net.xpc.IframePollingTransport.TIME_POLL_LONG_ = 100; 
goog.net.xpc.IframePollingTransport.TIME_SHORT_POLL_AFTER_ACTIVITY_ = 1000; 
goog.net.xpc.IframePollingTransport.receive_ = function() { 
  var rcvd = false; 
  try { 
    for(var i = 0, l = goog.net.xpc.IframePollingTransport.receivers_.length; i < l; i ++) { 
      rcvd = rcvd || goog.net.xpc.IframePollingTransport.receivers_[i].receive(); 
    } 
  } catch(e) { 
    goog.net.xpc.logger.info('receive_() failed: ' + e); 
    goog.net.xpc.IframePollingTransport.receivers_[i].transport_.channel_.notifyTransportError_(); 
    if(! goog.net.xpc.IframePollingTransport.receivers_.length) { 
      return; 
    } 
  } 
  var now = goog.now(); 
  if(rcvd) { 
    goog.net.xpc.IframePollingTransport.lastActivity_ = now; 
  } 
  var t = now - goog.net.xpc.IframePollingTransport.lastActivity_ < goog.net.xpc.IframePollingTransport.TIME_SHORT_POLL_AFTER_ACTIVITY_ ? goog.net.xpc.IframePollingTransport.TIME_POLL_SHORT_: goog.net.xpc.IframePollingTransport.TIME_POLL_LONG_; 
  goog.net.xpc.IframePollingTransport.rcvTimer_ = window.setTimeout(goog.net.xpc.IframePollingTransport.receiveCb_, t); 
}; 
goog.net.xpc.IframePollingTransport.receiveCb_ = goog.bind(goog.net.xpc.IframePollingTransport.receive_, goog.net.xpc.IframePollingTransport); 
goog.net.xpc.IframePollingTransport.startRcvTimer_ = function() { 
  goog.net.xpc.logger.fine('starting receive-timer'); 
  goog.net.xpc.IframePollingTransport.lastActivity_ = goog.now(); 
  if(goog.net.xpc.IframePollingTransport.rcvTimer_) { 
    window.clearTimeout(goog.net.xpc.IframePollingTransport.rcvTimer_); 
  } 
  goog.net.xpc.IframePollingTransport.rcvTimer_ = window.setTimeout(goog.net.xpc.IframePollingTransport.receiveCb_, goog.net.xpc.IframePollingTransport.TIME_POLL_SHORT_); 
}; 
goog.net.xpc.IframePollingTransport.Sender = function(url, windowObj) { 
  this.sendUri_ = url; 
  this.sendFrame_ = windowObj; 
  this.cycle_ = 0; 
}; 
goog.net.xpc.IframePollingTransport.Sender.prototype.send = function(payload) { 
  this.cycle_ = ++ this.cycle_ % 2; 
  var url = this.sendUri_ + '#' + this.cycle_ + encodeURIComponent(payload); 
  try { 
    if(goog.userAgent.WEBKIT) { 
      this.sendFrame_.location.href = url; 
    } else { 
      this.sendFrame_.location.replace(url); 
    } 
  } catch(e) { 
    goog.net.xpc.logger.severe('sending failed', e); 
  } 
  goog.net.xpc.IframePollingTransport.startRcvTimer_(); 
}; 
goog.net.xpc.IframePollingTransport.Receiver = function(transport, windowObj, callback) { 
  this.transport_ = transport; 
  this.rcvFrame_ = windowObj; 
  this.cb_ = callback; 
  this.currentLoc_ = this.rcvFrame_.location.href.split('#')[0]+ '#INITIAL'; 
  goog.net.xpc.IframePollingTransport.receivers_.push(this); 
  goog.net.xpc.IframePollingTransport.startRcvTimer_(); 
}; 
goog.net.xpc.IframePollingTransport.Receiver.prototype.receive = function() { 
  var loc = this.rcvFrame_.location.href; 
  if(loc != this.currentLoc_) { 
    this.currentLoc_ = loc; 
    var payload = loc.split('#')[1]; 
    if(payload) { 
      payload = payload.substr(1); 
      this.cb_(decodeURIComponent(payload)); 
    } 
    return true; 
  } else { 
    return false; 
  } 
}; 

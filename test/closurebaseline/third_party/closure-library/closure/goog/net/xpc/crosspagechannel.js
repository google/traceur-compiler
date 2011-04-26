
goog.provide('goog.net.xpc.CrossPageChannel'); 
goog.provide('goog.net.xpc.CrossPageChannel.Role'); 
goog.require('goog.Disposable'); 
goog.require('goog.Uri'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.json'); 
goog.require('goog.messaging.AbstractChannel'); 
goog.require('goog.net.xpc'); 
goog.require('goog.net.xpc.FrameElementMethodTransport'); 
goog.require('goog.net.xpc.IframePollingTransport'); 
goog.require('goog.net.xpc.IframeRelayTransport'); 
goog.require('goog.net.xpc.NativeMessagingTransport'); 
goog.require('goog.net.xpc.NixTransport'); 
goog.require('goog.net.xpc.Transport'); 
goog.require('goog.userAgent'); 
goog.net.xpc.CrossPageChannel = function(cfg, opt_domHelper) { 
  goog.base(this); 
  for(var i = 0, uriField; uriField = goog.net.xpc.UriCfgFields[i]; i ++) { 
    if(uriField in cfg && ! /^https?:\/\//.test(cfg[uriField])) { 
      throw Error('URI ' + cfg[uriField]+ ' is invalid for field ' + uriField); 
    } 
  } 
  this.cfg_ = cfg; 
  this.name = this.cfg_[goog.net.xpc.CfgFields.CHANNEL_NAME]|| goog.net.xpc.getRandomString(10); 
  this.domHelper_ = opt_domHelper || goog.dom.getDomHelper(); 
  cfg[goog.net.xpc.CfgFields.LOCAL_POLL_URI]= cfg[goog.net.xpc.CfgFields.LOCAL_POLL_URI]|| goog.uri.utils.getHost(this.domHelper_.getWindow().location.href) + '/robots.txt'; 
  cfg[goog.net.xpc.CfgFields.PEER_POLL_URI]= cfg[goog.net.xpc.CfgFields.PEER_POLL_URI]|| goog.uri.utils.getHost(cfg[goog.net.xpc.CfgFields.PEER_URI]|| '') + '/robots.txt'; 
  goog.net.xpc.channels_[this.name]= this; 
  goog.events.listen(window, 'unload', goog.net.xpc.CrossPageChannel.disposeAll_); 
  goog.net.xpc.logger.info('CrossPageChannel created: ' + this.name); 
}; 
goog.inherits(goog.net.xpc.CrossPageChannel, goog.messaging.AbstractChannel); 
goog.net.xpc.CrossPageChannel.TRANSPORT_SERVICE_ESCAPE_RE_ = new RegExp('^%*' + goog.net.xpc.TRANSPORT_SERVICE_ + '$'); 
goog.net.xpc.CrossPageChannel.TRANSPORT_SERVICE_UNESCAPE_RE_ = new RegExp('^%+' + goog.net.xpc.TRANSPORT_SERVICE_ + '$'); 
goog.net.xpc.CrossPageChannel.prototype.transport_ = null; 
goog.net.xpc.CrossPageChannel.prototype.state_ = goog.net.xpc.ChannelStates.NOT_CONNECTED; 
goog.net.xpc.CrossPageChannel.prototype.isConnected = function() { 
  return this.state_ == goog.net.xpc.ChannelStates.CONNECTED; 
}; 
goog.net.xpc.CrossPageChannel.prototype.peerWindowObject_ = null; 
goog.net.xpc.CrossPageChannel.prototype.iframeElement_ = null; 
goog.net.xpc.CrossPageChannel.prototype.setPeerWindowObject = function(peerWindowObject) { 
  this.peerWindowObject_ = peerWindowObject; 
}; 
goog.net.xpc.CrossPageChannel.prototype.determineTransportType_ = function() { 
  var transportType; 
  if(goog.isFunction(document.postMessage) || goog.isFunction(window.postMessage) ||(goog.userAgent.IE && window.postMessage)) { 
    transportType = goog.net.xpc.TransportTypes.NATIVE_MESSAGING; 
  } else if(goog.userAgent.GECKO) { 
    transportType = goog.net.xpc.TransportTypes.FRAME_ELEMENT_METHOD; 
  } else if(goog.userAgent.IE && this.cfg_[goog.net.xpc.CfgFields.PEER_RELAY_URI]) { 
    transportType = goog.net.xpc.TransportTypes.IFRAME_RELAY; 
  } else if(goog.userAgent.IE && goog.net.xpc.NixTransport.isNixSupported()) { 
    transportType = goog.net.xpc.TransportTypes.NIX; 
  } else { 
    transportType = goog.net.xpc.TransportTypes.IFRAME_POLLING; 
  } 
  return transportType; 
}; 
goog.net.xpc.CrossPageChannel.prototype.createTransport_ = function() { 
  if(this.transport_) { 
    return; 
  } 
  if(! this.cfg_[goog.net.xpc.CfgFields.TRANSPORT]) { 
    this.cfg_[goog.net.xpc.CfgFields.TRANSPORT]= this.determineTransportType_(); 
  } 
  switch(this.cfg_[goog.net.xpc.CfgFields.TRANSPORT]) { 
    case goog.net.xpc.TransportTypes.NATIVE_MESSAGING: 
      this.transport_ = new goog.net.xpc.NativeMessagingTransport(this, this.cfg_[goog.net.xpc.CfgFields.PEER_HOSTNAME], this.domHelper_); 
      break; 

    case goog.net.xpc.TransportTypes.NIX: 
      this.transport_ = new goog.net.xpc.NixTransport(this, this.domHelper_); 
      break; 

    case goog.net.xpc.TransportTypes.FRAME_ELEMENT_METHOD: 
      this.transport_ = new goog.net.xpc.FrameElementMethodTransport(this, this.domHelper_); 
      break; 

    case goog.net.xpc.TransportTypes.IFRAME_RELAY: 
      this.transport_ = new goog.net.xpc.IframeRelayTransport(this, this.domHelper_); 
      break; 

    case goog.net.xpc.TransportTypes.IFRAME_POLLING: 
      this.transport_ = new goog.net.xpc.IframePollingTransport(this, this.domHelper_); 
      break; 

  } 
  if(this.transport_) { 
    goog.net.xpc.logger.info('Transport created: ' + this.transport_.getName()); 
  } else { 
    throw Error('CrossPageChannel: No suitable transport found!'); 
  } 
}; 
goog.net.xpc.CrossPageChannel.prototype.getTransportType = function() { 
  return this.transport_.getType(); 
}; 
goog.net.xpc.CrossPageChannel.prototype.getTransportName = function() { 
  return this.transport_.getName(); 
}; 
goog.net.xpc.CrossPageChannel.prototype.getPeerConfiguration = function() { 
  var peerCfg = { }; 
  peerCfg[goog.net.xpc.CfgFields.CHANNEL_NAME]= this.name; 
  peerCfg[goog.net.xpc.CfgFields.TRANSPORT]= this.cfg_[goog.net.xpc.CfgFields.TRANSPORT]; 
  if(this.cfg_[goog.net.xpc.CfgFields.LOCAL_RELAY_URI]) { 
    peerCfg[goog.net.xpc.CfgFields.PEER_RELAY_URI]= this.cfg_[goog.net.xpc.CfgFields.LOCAL_RELAY_URI]; 
  } 
  if(this.cfg_[goog.net.xpc.CfgFields.LOCAL_POLL_URI]) { 
    peerCfg[goog.net.xpc.CfgFields.PEER_POLL_URI]= this.cfg_[goog.net.xpc.CfgFields.LOCAL_POLL_URI]; 
  } 
  if(this.cfg_[goog.net.xpc.CfgFields.PEER_POLL_URI]) { 
    peerCfg[goog.net.xpc.CfgFields.LOCAL_POLL_URI]= this.cfg_[goog.net.xpc.CfgFields.PEER_POLL_URI]; 
  } 
  return peerCfg; 
}; 
goog.net.xpc.CrossPageChannel.prototype.createPeerIframe = function(parentElm, opt_configureIframeCb, opt_addCfgParam) { 
  var iframeId = this.cfg_[goog.net.xpc.CfgFields.IFRAME_ID]; 
  if(! iframeId) { 
    iframeId = this.cfg_[goog.net.xpc.CfgFields.IFRAME_ID]= 'xpcpeer' + goog.net.xpc.getRandomString(4); 
  } 
  var iframeElm = goog.dom.createElement('IFRAME'); 
  iframeElm.id = iframeElm.name = iframeId; 
  if(opt_configureIframeCb) { 
    opt_configureIframeCb(iframeElm); 
  } else { 
    iframeElm.style.width = iframeElm.style.height = '100%'; 
  } 
  var peerUri = this.cfg_[goog.net.xpc.CfgFields.PEER_URI]; 
  if(goog.isString(peerUri)) { 
    peerUri = this.cfg_[goog.net.xpc.CfgFields.PEER_URI]= new goog.Uri(peerUri); 
  } 
  if(opt_addCfgParam !== false) { 
    peerUri.setParameterValue('xpc', goog.json.serialize(this.getPeerConfiguration())); 
  } 
  if(goog.userAgent.GECKO || goog.userAgent.WEBKIT) { 
    this.deferConnect_ = true; 
    window.setTimeout(goog.bind(function() { 
      this.deferConnect_ = false; 
      parentElm.appendChild(iframeElm); 
      iframeElm.src = peerUri.toString(); 
      goog.net.xpc.logger.info('peer iframe created (' + iframeId + ')'); 
      if(this.connectDeferred_) { 
        this.connect(this.connectCb_); 
      } 
    }, this), 1); 
  } else { 
    iframeElm.src = peerUri.toString(); 
    parentElm.appendChild(iframeElm); 
    goog.net.xpc.logger.info('peer iframe created (' + iframeId + ')'); 
  } 
  return(iframeElm); 
}; 
goog.net.xpc.CrossPageChannel.prototype.deferConnect_ = false; 
goog.net.xpc.CrossPageChannel.prototype.connectDeferred_ = false; 
goog.net.xpc.CrossPageChannel.prototype.connect = function(opt_connectCb) { 
  this.connectCb_ = opt_connectCb || goog.nullFunction; 
  if(this.deferConnect_) { 
    goog.net.xpc.logger.info('connect() deferred'); 
    this.connectDeferred_ = true; 
    return; 
  } 
  goog.net.xpc.logger.info('connect()'); 
  if(this.cfg_[goog.net.xpc.CfgFields.IFRAME_ID]) { 
    this.iframeElement_ = this.domHelper_.getElement(this.cfg_[goog.net.xpc.CfgFields.IFRAME_ID]); 
  } 
  if(this.iframeElement_) { 
    var winObj = this.iframeElement_.contentWindow; 
    if(! winObj) { 
      winObj = window.frames[this.cfg_[goog.net.xpc.CfgFields.IFRAME_ID]]; 
    } 
    this.setPeerWindowObject(winObj); 
  } 
  if(! this.peerWindowObject_) { 
    if(window == top) { 
      throw Error("CrossPageChannel: Can't connect, peer window-object not set."); 
    } else { 
      this.setPeerWindowObject(window.parent); 
    } 
  } 
  this.createTransport_(); 
  this.transport_.connect(); 
}; 
goog.net.xpc.CrossPageChannel.prototype.close = function() { 
  if(! this.isConnected()) return; 
  this.state_ = goog.net.xpc.ChannelStates.CLOSED; 
  this.transport_.dispose(); 
  this.transport_ = null; 
  goog.net.xpc.logger.info('Channel "' + this.name + '" closed'); 
}; 
goog.net.xpc.CrossPageChannel.prototype.notifyConnected_ = function() { 
  if(this.isConnected()) { 
    return; 
  } 
  this.state_ = goog.net.xpc.ChannelStates.CONNECTED; 
  goog.net.xpc.logger.info('Channel "' + this.name + '" connected'); 
  this.connectCb_(); 
}; 
goog.net.xpc.CrossPageChannel.prototype.notifyTransportError_ = function() { 
  goog.net.xpc.logger.info('Transport Error'); 
  this.close(); 
}; 
goog.net.xpc.CrossPageChannel.prototype.send = function(serviceName, payload) { 
  if(! this.isConnected()) { 
    goog.net.xpc.logger.severe('Can\'t send. Channel not connected.'); 
    return; 
  } 
  if(this.peerWindowObject_.closed) { 
    goog.net.xpc.logger.severe('Peer has disappeared.'); 
    this.close(); 
    return; 
  } 
  if(goog.isObject(payload)) { 
    payload = goog.json.serialize(payload); 
  } 
  this.transport_.send(this.escapeServiceName_(serviceName), payload); 
}; 
goog.net.xpc.CrossPageChannel.prototype.deliver_ = function(serviceName, payload, opt_origin) { 
  if(! this.isMessageOriginAcceptable_(opt_origin)) { 
    goog.net.xpc.logger.warning('Message received from unapproved origin "' + opt_origin + '" - rejected.'); 
    return; 
  } 
  if(this.isDisposed()) { 
    goog.net.xpc.logger.warning('CrossPageChannel::deliver_(): Disposed.'); 
  } else if(! serviceName || serviceName == goog.net.xpc.TRANSPORT_SERVICE_) { 
    this.transport_.transportServiceHandler(payload); 
  } else { 
    if(this.isConnected()) { 
      this.deliver(this.unescapeServiceName_(serviceName), payload); 
    } else { 
      goog.net.xpc.logger.info('CrossPageChannel::deliver_(): Not connected.'); 
    } 
  } 
}; 
goog.net.xpc.CrossPageChannel.prototype.escapeServiceName_ = function(name) { 
  if(goog.net.xpc.CrossPageChannel.TRANSPORT_SERVICE_ESCAPE_RE_.test(name)) { 
    name = '%' + name; 
  } 
  return name.replace(/[%:|]/g, encodeURIComponent); 
}; 
goog.net.xpc.CrossPageChannel.prototype.unescapeServiceName_ = function(name) { 
  name = name.replace(/%[0-9a-f]{2}/gi, decodeURIComponent); 
  if(goog.net.xpc.CrossPageChannel.TRANSPORT_SERVICE_UNESCAPE_RE_.test(name)) { 
    return name.substring(1); 
  } else { 
    return name; 
  } 
}; 
goog.net.xpc.CrossPageChannel.Role = { 
  OUTER: 0, 
  INNER: 1 
}; 
goog.net.xpc.CrossPageChannel.prototype.getRole = function() { 
  return window.parent == this.peerWindowObject_ ? goog.net.xpc.CrossPageChannel.Role.INNER: goog.net.xpc.CrossPageChannel.Role.OUTER; 
}; 
goog.net.xpc.CrossPageChannel.prototype.isMessageOriginAcceptable_ = function(opt_origin) { 
  var peerHostname = this.cfg_[goog.net.xpc.CfgFields.PEER_HOSTNAME]; 
  return goog.string.isEmptySafe(opt_origin) || goog.string.isEmptySafe(peerHostname) || opt_origin == this.cfg_[goog.net.xpc.CfgFields.PEER_HOSTNAME]; 
}; 
goog.net.xpc.CrossPageChannel.prototype.disposeInternal = function() { 
  goog.base(this, 'disposeInternal'); 
  this.close(); 
  this.peerWindowObject_ = null; 
  this.iframeElement_ = null; 
  delete goog.net.xpc.channels_[this.name]; 
}; 
goog.net.xpc.CrossPageChannel.disposeAll_ = function() { 
  for(var name in goog.net.xpc.channels_) { 
    var ch = goog.net.xpc.channels_[name]; 
    if(ch) { 
      ch.dispose(); 
    } 
  } 
}; 

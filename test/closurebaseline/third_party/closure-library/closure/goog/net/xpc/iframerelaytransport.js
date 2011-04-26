
goog.provide('goog.net.xpc.IframeRelayTransport'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.net.xpc'); 
goog.require('goog.net.xpc.Transport'); 
goog.require('goog.userAgent'); 
goog.net.xpc.IframeRelayTransport = function(channel, opt_domHelper) { 
  goog.base(this, opt_domHelper); 
  this.channel_ = channel; 
  this.peerRelayUri_ = this.channel_.cfg_[goog.net.xpc.CfgFields.PEER_RELAY_URI]; 
  this.peerIframeId_ = this.channel_.cfg_[goog.net.xpc.CfgFields.IFRAME_ID]; 
  if(goog.userAgent.WEBKIT) { 
    goog.net.xpc.IframeRelayTransport.startCleanupTimer_(); 
  } 
}; 
goog.inherits(goog.net.xpc.IframeRelayTransport, goog.net.xpc.Transport); 
if(goog.userAgent.WEBKIT) { 
  goog.net.xpc.IframeRelayTransport.iframeRefs_ =[]; 
  goog.net.xpc.IframeRelayTransport.CLEANUP_INTERVAL_ = 1000; 
  goog.net.xpc.IframeRelayTransport.IFRAME_MAX_AGE_ = 3000; 
  goog.net.xpc.IframeRelayTransport.cleanupTimer_ = 0; 
  goog.net.xpc.IframeRelayTransport.startCleanupTimer_ = function() { 
    if(! goog.net.xpc.IframeRelayTransport.cleanupTimer_) { 
      goog.net.xpc.IframeRelayTransport.cleanupTimer_ = window.setTimeout(function() { 
        goog.net.xpc.IframeRelayTransport.cleanup_(); 
      }, goog.net.xpc.IframeRelayTransport.CLEANUP_INTERVAL_); 
    } 
  }; 
  goog.net.xpc.IframeRelayTransport.cleanup_ = function(opt_maxAge) { 
    var now = goog.now(); 
    var maxAge = opt_maxAge || goog.net.xpc.IframeRelayTransport.IFRAME_MAX_AGE_; 
    while(goog.net.xpc.IframeRelayTransport.iframeRefs_.length && now - goog.net.xpc.IframeRelayTransport.iframeRefs_[0].timestamp >= maxAge) { 
      var ifr = goog.net.xpc.IframeRelayTransport.iframeRefs_.shift().iframeElement; 
      goog.dom.removeNode(ifr); 
      goog.net.xpc.logger.finest('iframe removed'); 
    } 
    goog.net.xpc.IframeRelayTransport.cleanupTimer_ = window.setTimeout(goog.net.xpc.IframeRelayTransport.cleanupCb_, goog.net.xpc.IframeRelayTransport.CLEANUP_INTERVAL_); 
  }; 
  goog.net.xpc.IframeRelayTransport.cleanupCb_ = function() { 
    goog.net.xpc.IframeRelayTransport.cleanup_(); 
  }; 
} 
goog.net.xpc.IframeRelayTransport.IE_PAYLOAD_MAX_SIZE_ = 1800; 
goog.net.xpc.IframeRelayTransport.FragmentInfo; 
goog.net.xpc.IframeRelayTransport.fragmentMap_ = { }; 
goog.net.xpc.IframeRelayTransport.prototype.transportType = goog.net.xpc.TransportTypes.IFRAME_RELAY; 
goog.net.xpc.IframeRelayTransport.prototype.connect = function() { 
  if(! this.getWindow()['xpcRelay']) { 
    this.getWindow()['xpcRelay']= goog.net.xpc.IframeRelayTransport.receiveMessage_; 
  } 
  this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP); 
}; 
goog.net.xpc.IframeRelayTransport.receiveMessage_ = function(channelName, frame) { 
  var pos = frame.indexOf(':'); 
  var header = frame.substr(0, pos); 
  var payload = frame.substr(pos + 1); 
  if(! goog.userAgent.IE ||(pos = header.indexOf('|')) == - 1) { 
    var service = header; 
  } else { 
    var service = header.substr(0, pos); 
    var fragmentIdStr = header.substr(pos + 1); 
    pos = fragmentIdStr.indexOf('+'); 
    var messageIdStr = fragmentIdStr.substr(0, pos); 
    var fragmentNum = parseInt(fragmentIdStr.substr(pos + 1), 10); 
    var fragmentInfo = goog.net.xpc.IframeRelayTransport.fragmentMap_[messageIdStr]; 
    if(! fragmentInfo) { 
      fragmentInfo = goog.net.xpc.IframeRelayTransport.fragmentMap_[messageIdStr]= { 
        fragments:[], 
        received: 0, 
        expected: 0 
      }; 
    } 
    if(goog.string.contains(fragmentIdStr, '++')) { 
      fragmentInfo.expected = fragmentNum + 1; 
    } 
    fragmentInfo.fragments[fragmentNum]= payload; 
    fragmentInfo.received ++; 
    if(fragmentInfo.received != fragmentInfo.expected) { 
      return; 
    } 
    payload = fragmentInfo.fragments.join(''); 
    delete goog.net.xpc.IframeRelayTransport.fragmentMap_[messageIdStr]; 
  } 
  goog.net.xpc.channels_[channelName].deliver_(service, decodeURIComponent(payload)); 
}; 
goog.net.xpc.IframeRelayTransport.prototype.transportServiceHandler = function(payload) { 
  if(payload == goog.net.xpc.SETUP) { 
    this.send(goog.net.xpc.TRANSPORT_SERVICE_, goog.net.xpc.SETUP_ACK_); 
    this.channel_.notifyConnected_(); 
  } else if(payload == goog.net.xpc.SETUP_ACK_) { 
    this.channel_.notifyConnected_(); 
  } 
}; 
goog.net.xpc.IframeRelayTransport.prototype.send = function(service, payload) { 
  var encodedPayload = encodeURIComponent(payload); 
  var encodedLen = encodedPayload.length; 
  var maxSize = goog.net.xpc.IframeRelayTransport.IE_PAYLOAD_MAX_SIZE_; 
  if(goog.userAgent.IE && encodedLen > maxSize) { 
    var messageIdStr = goog.string.getRandomString(); 
    for(var startIndex = 0, fragmentNum = 0; startIndex < encodedLen; fragmentNum ++) { 
      var payloadFragment = encodedPayload.substr(startIndex, maxSize); 
      startIndex += maxSize; 
      var fragmentIdStr = messageIdStr +(startIndex >= encodedLen ? '++': '+') + fragmentNum; 
      this.send_(service, payloadFragment, fragmentIdStr); 
    } 
  } else { 
    this.send_(service, encodedPayload); 
  } 
}; 
goog.net.xpc.IframeRelayTransport.prototype.send_ = function(service, encodedPayload, opt_fragmentIdStr) { 
  if(goog.userAgent.IE) { 
    var div = this.getWindow().document.createElement('div'); 
    div.innerHTML = '<iframe onload="this.xpcOnload()"></iframe>'; 
    var ifr = div.childNodes[0]; 
    div = null; 
    ifr['xpcOnload']= goog.net.xpc.IframeRelayTransport.iframeLoadHandler_; 
  } else { 
    var ifr = this.getWindow().document.createElement('iframe'); 
    if(goog.userAgent.WEBKIT) { 
      goog.net.xpc.IframeRelayTransport.iframeRefs_.push({ 
        timestamp: goog.now(), 
        iframeElement: ifr 
      }); 
    } else { 
      goog.events.listen(ifr, 'load', goog.net.xpc.IframeRelayTransport.iframeLoadHandler_); 
    } 
  } 
  var style = ifr.style; 
  style.visibility = 'hidden'; 
  style.width = ifr.style.height = '0px'; 
  style.position = 'absolute'; 
  var url = this.peerRelayUri_; 
  url += '#' + this.channel_.name; 
  if(this.peerIframeId_) { 
    url += ',' + this.peerIframeId_; 
  } 
  url += '|' + service; 
  if(opt_fragmentIdStr) { 
    url += '|' + opt_fragmentIdStr; 
  } 
  url += ':' + encodedPayload; 
  ifr.src = url; 
  this.getWindow().document.body.appendChild(ifr); 
  goog.net.xpc.logger.finest('msg sent: ' + url); 
}; 
goog.net.xpc.IframeRelayTransport.iframeLoadHandler_ = function() { 
  goog.net.xpc.logger.finest('iframe-load'); 
  goog.dom.removeNode(this); 
  this.xpcOnload = null; 
}; 
goog.net.xpc.IframeRelayTransport.prototype.disposeInternal = function() { 
  goog.base(this, 'disposeInternal'); 
  if(goog.userAgent.WEBKIT) { 
    goog.net.xpc.IframeRelayTransport.cleanup_(0); 
  } 
}; 

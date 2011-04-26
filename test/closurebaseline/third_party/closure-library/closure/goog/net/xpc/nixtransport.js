
goog.provide('goog.net.xpc.NixTransport'); 
goog.require('goog.net.xpc'); 
goog.require('goog.net.xpc.Transport'); 
goog.require('goog.reflect'); 
goog.net.xpc.NixTransport = function(channel, opt_domHelper) { 
  goog.base(this, opt_domHelper); 
  this.channel_ = channel; 
  this.authToken_ = channel[goog.net.xpc.CfgFields.AUTH_TOKEN]|| ''; 
  this.remoteAuthToken_ = channel[goog.net.xpc.CfgFields.REMOTE_AUTH_TOKEN]|| ''; 
  goog.net.xpc.NixTransport.conductGlobalSetup_(this.getWindow()); 
  this[goog.net.xpc.NixTransport.NIX_HANDLE_MESSAGE]= this.handleMessage_; 
  this[goog.net.xpc.NixTransport.NIX_CREATE_CHANNEL]= this.createChannel_; 
}; 
goog.inherits(goog.net.xpc.NixTransport, goog.net.xpc.Transport); 
goog.net.xpc.NixTransport.NIX_WRAPPER = 'GCXPC____NIXVBS_wrapper'; 
goog.net.xpc.NixTransport.NIX_GET_WRAPPER = 'GCXPC____NIXVBS_get_wrapper'; 
goog.net.xpc.NixTransport.NIX_HANDLE_MESSAGE = 'GCXPC____NIXJS_handle_message'; 
goog.net.xpc.NixTransport.NIX_CREATE_CHANNEL = 'GCXPC____NIXJS_create_channel'; 
goog.net.xpc.NixTransport.NIX_ID_FIELD = 'GCXPC____NIXVBS_container'; 
goog.net.xpc.NixTransport.isNixSupported = function() { 
  var isSupported = false; 
  try { 
    var oldOpener = window.opener; 
    window.opener =({ }); 
    isSupported = goog.reflect.canAccessProperty(window, 'opener'); 
    window.opener = oldOpener; 
  } catch(e) { } 
  return isSupported; 
}; 
goog.net.xpc.NixTransport.conductGlobalSetup_ = function(listenWindow) { 
  if(listenWindow['nix_setup_complete']) { 
    return; 
  } 
  var vbscript = 'Class ' + goog.net.xpc.NixTransport.NIX_WRAPPER + '\n ' + 'Private m_Transport\n' + 'Private m_Auth\n' + 'Public Sub SetTransport(transport)\n' + 'If isEmpty(m_Transport) Then\n' + 'Set m_Transport = transport\n' + 'End If\n' + 'End Sub\n' + 'Public Sub SetAuth(auth)\n' + 'If isEmpty(m_Auth) Then\n' + 'm_Auth = auth\n' + 'End If\n' + 'End Sub\n' + 'Public Function GetAuthToken()\n ' + 'GetAuthToken = m_Auth\n' + 'End Function\n' + 'Public Sub SendMessage(service, payload)\n ' + 'Call m_Transport.' + goog.net.xpc.NixTransport.NIX_HANDLE_MESSAGE + '(service, payload)\n' + 'End Sub\n' + 'Public Sub CreateChannel(channel)\n ' + 'Call m_Transport.' + goog.net.xpc.NixTransport.NIX_CREATE_CHANNEL + '(channel)\n' + 'End Sub\n' + 'Public Sub ' + goog.net.xpc.NixTransport.NIX_ID_FIELD + '()\n ' + 'End Sub\n' + 'End Class\n ' + 'Function ' + goog.net.xpc.NixTransport.NIX_GET_WRAPPER + '(transport, auth)\n' + 'Dim wrap\n' + 'Set wrap = New ' + goog.net.xpc.NixTransport.NIX_WRAPPER + '\n' + 'wrap.SetTransport transport\n' + 'wrap.SetAuth auth\n' + 'Set ' + goog.net.xpc.NixTransport.NIX_GET_WRAPPER + ' = wrap\n' + 'End Function'; 
  try { 
    listenWindow.execScript(vbscript, 'vbscript'); 
    listenWindow['nix_setup_complete']= true; 
  } catch(e) { 
    goog.net.xpc.logger.severe('exception caught while attempting global setup: ' + e); 
  } 
}; 
goog.net.xpc.NixTransport.prototype.transportType = goog.net.xpc.TransportTypes.NIX; 
goog.net.xpc.NixTransport.prototype.localSetupCompleted_ = false; 
goog.net.xpc.NixTransport.prototype.nixChannel_ = null; 
goog.net.xpc.NixTransport.prototype.connect = function() { 
  if(this.channel_.getRole() == goog.net.xpc.CrossPageChannel.Role.OUTER) { 
    this.attemptOuterSetup_(); 
  } else { 
    this.attemptInnerSetup_(); 
  } 
}; 
goog.net.xpc.NixTransport.prototype.attemptOuterSetup_ = function() { 
  if(this.localSetupCompleted_) { 
    return; 
  } 
  var innerFrame = this.channel_.iframeElement_; 
  try { 
    innerFrame.contentWindow.opener = this.getWindow()[goog.net.xpc.NixTransport.NIX_GET_WRAPPER](this, this.authToken_); 
    this.localSetupCompleted_ = true; 
  } catch(e) { 
    goog.net.xpc.logger.severe('exception caught while attempting setup: ' + e); 
  } 
  if(! this.localSetupCompleted_) { 
    this.getWindow().setTimeout(goog.bind(this.attemptOuterSetup_, this), 100); 
  } 
}; 
goog.net.xpc.NixTransport.prototype.attemptInnerSetup_ = function() { 
  if(this.localSetupCompleted_) { 
    return; 
  } 
  try { 
    var opener = this.getWindow().opener; 
    if(opener && goog.net.xpc.NixTransport.NIX_ID_FIELD in opener) { 
      this.nixChannel_ = opener; 
      var remoteAuthToken = this.nixChannel_['GetAuthToken'](); 
      if(remoteAuthToken != this.remoteAuthToken_) { 
        goog.net.xpc.logger.severe('Invalid auth token from other party'); 
        return; 
      } 
      this.nixChannel_['CreateChannel'](this.getWindow()[goog.net.xpc.NixTransport.NIX_GET_WRAPPER](this, this.authToken_)); 
      this.localSetupCompleted_ = true; 
      this.channel_.notifyConnected_(); 
    } 
  } catch(e) { 
    goog.net.xpc.logger.severe('exception caught while attempting setup: ' + e); 
    return; 
  } 
  if(! this.localSetupCompleted_) { 
    this.getWindow().setTimeout(goog.bind(this.attemptInnerSetup_, this), 100); 
  } 
}; 
goog.net.xpc.NixTransport.prototype.createChannel_ = function(channel) { 
  if(typeof channel != 'unknown' || !(goog.net.xpc.NixTransport.NIX_ID_FIELD in channel)) { 
    goog.net.xpc.logger.severe('Invalid NIX channel given to createChannel_'); 
  } 
  this.nixChannel_ = channel; 
  var remoteAuthToken = this.nixChannel_['GetAuthToken'](); 
  if(remoteAuthToken != this.remoteAuthToken_) { 
    goog.net.xpc.logger.severe('Invalid auth token from other party'); 
    return; 
  } 
  this.channel_.notifyConnected_(); 
}; 
goog.net.xpc.NixTransport.prototype.handleMessage_ = function(serviceName, payload) { 
  function deliveryHandler() { 
    this.channel_.deliver_(serviceName, payload); 
  } 
  this.getWindow().setTimeout(goog.bind(deliveryHandler, this), 1); 
}; 
goog.net.xpc.NixTransport.prototype.send = function(service, payload) { 
  if(typeof(this.nixChannel_) !== 'unknown') { 
    goog.net.xpc.logger.severe('NIX channel not connected'); 
  } 
  this.nixChannel_['SendMessage'](service, payload); 
}; 
goog.net.xpc.NixTransport.prototype.disposeInternal = function() { 
  goog.base(this, 'disposeInternal'); 
  this.nixChannel_ = null; 
}; 

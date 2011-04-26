
goog.provide('goog.net.xpc'); 
goog.provide('goog.net.xpc.CfgFields'); 
goog.provide('goog.net.xpc.ChannelStates'); 
goog.provide('goog.net.xpc.TransportNames'); 
goog.provide('goog.net.xpc.TransportTypes'); 
goog.provide('goog.net.xpc.UriCfgFields'); 
goog.require('goog.debug.Logger'); 
goog.net.xpc.TransportTypes = { 
  NATIVE_MESSAGING: 1, 
  FRAME_ELEMENT_METHOD: 2, 
  IFRAME_RELAY: 3, 
  IFRAME_POLLING: 4, 
  FLASH: 5, 
  NIX: 6 
}; 
goog.net.xpc.TransportNames = { 
  '1': 'NativeMessagingTransport', 
  '2': 'FrameElementMethodTransport', 
  '3': 'IframeRelayTransport', 
  '4': 'IframePollingTransport', 
  '5': 'FlashTransport', 
  '6': 'NixTransport' 
}; 
goog.net.xpc.CfgFields = { 
  CHANNEL_NAME: 'cn', 
  AUTH_TOKEN: 'at', 
  REMOTE_AUTH_TOKEN: 'rat', 
  PEER_URI: 'pu', 
  IFRAME_ID: 'ifrid', 
  TRANSPORT: 'tp', 
  LOCAL_RELAY_URI: 'lru', 
  PEER_RELAY_URI: 'pru', 
  LOCAL_POLL_URI: 'lpu', 
  PEER_POLL_URI: 'ppu', 
  PEER_HOSTNAME: 'ph' 
}; 
goog.net.xpc.UriCfgFields =[goog.net.xpc.CfgFields.PEER_URI, goog.net.xpc.CfgFields.LOCAL_RELAY_URI, goog.net.xpc.CfgFields.PEER_RELAY_URI, goog.net.xpc.CfgFields.LOCAL_POLL_URI, goog.net.xpc.CfgFields.PEER_POLL_URI]; 
goog.net.xpc.ChannelStates = { 
  NOT_CONNECTED: 1, 
  CONNECTED: 2, 
  CLOSED: 3 
}; 
goog.net.xpc.TRANSPORT_SERVICE_ = 'tp'; 
goog.net.xpc.SETUP = 'SETUP'; 
goog.net.xpc.SETUP_ACK_ = 'SETUP_ACK'; 
goog.net.xpc.channels_ = { }; 
goog.net.xpc.getRandomString = function(length, opt_characters) { 
  var chars = opt_characters || goog.net.xpc.randomStringCharacters_; 
  var charsLength = chars.length; 
  var s = ''; 
  while(length -- > 0) { 
    s += chars.charAt(Math.floor(Math.random() * charsLength)); 
  } 
  return s; 
}; 
goog.net.xpc.randomStringCharacters_ = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; 
goog.net.xpc.logger = goog.debug.Logger.getLogger('goog.net.xpc'); 

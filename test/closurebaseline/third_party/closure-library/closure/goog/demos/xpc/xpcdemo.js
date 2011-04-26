
goog.require('goog.Uri'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.events.EventType'); 
goog.require('goog.json'); 
goog.require('goog.net.xpc.CrossPageChannel'); 
goog.global.initOuter = function() { 
  goog.events.listen(window, 'load', function() { 
    xpcdemo.initOuter(); 
  }); 
}; 
goog.global.initInner = function() { 
  goog.events.listen(window, 'load', function() { 
    xpcdemo.initInner(); 
  }); 
}; 
xpcdemo = { }; 
xpcdemo.initOuter = function() { 
  var cfg = { }; 
  var ownUri = new goog.Uri(window.location.href); 
  var relayUri = ownUri.resolve(new goog.Uri('relay.html')); 
  var pollUri = ownUri.resolve(new goog.Uri('blank.html')); 
  var peerDomain = ownUri.getParameterValue('peerdomain') || ownUri.getDomain(); 
  cfg[goog.net.xpc.CfgFields.LOCAL_RELAY_URI]= relayUri.toString(); 
  cfg[goog.net.xpc.CfgFields.PEER_RELAY_URI]= relayUri.setDomain(peerDomain).toString(); 
  cfg[goog.net.xpc.CfgFields.LOCAL_POLL_URI]= pollUri.toString(); 
  cfg[goog.net.xpc.CfgFields.PEER_POLL_URI]= pollUri.setDomain(peerDomain).toString(); 
  var tp = ownUri.getParameterValue('tp'); 
  if(tp) { 
    cfg[goog.net.xpc.CfgFields.TRANSPORT]= parseInt(tp, 10); 
  } 
  var peerUri = ownUri.resolve(new goog.Uri('inner.html')).setDomain(peerDomain); 
  if(goog.isDef(ownUri.getParameterValue('verbose'))) { 
    peerUri.setParameterValue('verbose', ''); 
  } 
  if(goog.isDef(ownUri.getParameterValue('compiled'))) { 
    peerUri.setParameterValue('compiled', ''); 
  } 
  cfg[goog.net.xpc.CfgFields.PEER_URI]= peerUri; 
  xpcdemo.channel = new goog.net.xpc.CrossPageChannel(cfg); 
  xpcdemo.peerIframe = xpcdemo.channel.createPeerIframe(goog.dom.getElement('iframeContainer')); 
  xpcdemo.initCommon_(); 
  goog.dom.getElement('inactive').style.display = 'none'; 
  goog.dom.getElement('active').style.display = ''; 
}; 
xpcdemo.initInner = function() { 
  var cfg = goog.json.parse((new goog.Uri(window.location.href)).getParameterValue('xpc')); 
  xpcdemo.channel = new goog.net.xpc.CrossPageChannel(cfg); 
  xpcdemo.initCommon_(); 
}; 
xpcdemo.initCommon_ = function() { 
  var xpcLogger = goog.debug.Logger.getLogger('goog.net.xpc'); 
  xpcLogger.addHandler(function(logRecord) { 
    xpcdemo.log('[XPC] ' + logRecord.getMessage()); 
  }); 
  xpcLogger.setLevel(window.location.href.match(/verbose/) ? goog.debug.Logger.Level.ALL: goog.debug.Logger.Level.INFO); 
  xpcdemo.channel.registerService('log', xpcdemo.log); 
  xpcdemo.channel.registerService('ping', xpcdemo.pingHandler_); 
  xpcdemo.channel.registerService('events', xpcdemo.eventsMsgHandler_); 
  xpcdemo.channel.connect(function() { 
    xpcdemo.channel.send('log', 'Hi from ' + window.location.host); 
    goog.events.listen(goog.dom.getElement('clickfwd'), 'click', xpcdemo.mouseEventHandler_); 
  }); 
}; 
xpcdemo.teardown = function() { 
  goog.events.unlisten(goog.dom.getElement('clickfwd'), goog.events.EventType.CLICK, xpcdemo.mouseEventHandler_); 
  xpcdemo.channel.dispose(); 
  delete xpcdemo.channel; 
  goog.dom.removeNode(xpcdemo.peerIframe); 
  xpcdemo.peerIframe = null; 
  goog.dom.getElement('inactive').style.display = ''; 
  goog.dom.getElement('active').style.display = 'none'; 
}; 
xpcdemo.log = function(msgString) { 
  xpcdemo.consoleElm ||(xpcdemo.consoleElm = goog.dom.getElement('console')); 
  var msgElm = goog.dom.createDom('div'); 
  msgElm.innerHTML = msgString; 
  xpcdemo.consoleElm.insertBefore(msgElm, xpcdemo.consoleElm.firstChild); 
}; 
xpcdemo.ping = function() { 
  xpcdemo.channel.send('ping', goog.now() + ''); 
}; 
xpcdemo.pingHandler_ = function(payload) { 
  if(payload.charAt(0) == '#') { 
    var dt = goog.now() - parseInt(payload.substring(1), 10); 
    xpcdemo.log('roundtrip: ' + dt + 'ms'); 
  } else { 
    xpcdemo.channel.send('ping', '#' + payload); 
    xpcdemo.log('ping reply sent'); 
  } 
}; 
xpcdemo.mmCount_ = 0; 
xpcdemo.mmLastRateOutput_ = 0; 
xpcdemo.startMousemoveForwarding = function() { 
  goog.events.listen(document, goog.events.EventType.MOUSEMOVE, xpcdemo.mouseEventHandler_); 
  xpcdemo.mmLastRateOutput_ = goog.now(); 
}; 
xpcdemo.stopMousemoveForwarding = function() { 
  goog.events.unlisten(document, goog.events.EventType.MOUSEMOVE, xpcdemo.mouseEventHandler_); 
}; 
xpcdemo.mouseEventHandler_ = function(e) { 
  xpcdemo.channel.send('events',[e.type, e.clientX, e.clientY, goog.now()].join(',')); 
}; 
xpcdemo.eventsMsgHandler_ = function(payload) { 
  var now = goog.now(); 
  var args = payload.split(','); 
  var type = args[0]; 
  var pageX = args[1]; 
  var pageY = args[2]; 
  var time = parseInt(args[3], 10); 
  var msg = type + ': (' + pageX + ',' + pageY + '), latency: ' +(now - time); 
  xpcdemo.log(msg); 
  if(type == goog.events.EventType.MOUSEMOVE) { 
    xpcdemo.mmCount_ ++; 
    var dt = now - xpcdemo.mmLastRateOutput_; 
    if(dt > 1000) { 
      msg = 'RATE (mousemove/s): ' +(1000 * xpcdemo.mmCount_ / dt); 
      xpcdemo.log(msg); 
      xpcdemo.mmLastRateOutput_ = now; 
      xpcdemo.mmCount_ = 0; 
    } 
  } 
}; 
xpcdemo.sendN = function(n) { 
  xpcdemo.count_ ||(xpcdemo.count_ = 1); 
  for(var i = 0; i < n; i ++) { 
    xpcdemo.channel.send('log', '' + xpcdemo.count_ ++); 
  } 
}; 

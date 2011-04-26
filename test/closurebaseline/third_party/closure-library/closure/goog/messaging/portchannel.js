
goog.provide('goog.messaging.PortChannel'); 
goog.require('goog.Timer'); 
goog.require('goog.array'); 
goog.require('goog.async.Deferred'); 
goog.require('goog.debug'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom'); 
goog.require('goog.dom.DomHelper'); 
goog.require('goog.events'); 
goog.require('goog.events.EventType'); 
goog.require('goog.json'); 
goog.require('goog.messaging.AbstractChannel'); 
goog.require('goog.messaging.DeferredChannel'); 
goog.require('goog.object'); 
goog.require('goog.string'); 
goog.messaging.PortChannel = function(underlyingPort) { 
  goog.base(this); 
  this.port_ = underlyingPort; 
  this.listenerKey_ = goog.events.listen(this.port_, goog.events.EventType.MESSAGE, this.deliver_, false, this); 
}; 
goog.inherits(goog.messaging.PortChannel, goog.messaging.AbstractChannel); 
goog.messaging.PortChannel.forEmbeddedWindow = function(window, peerOrigin, opt_timer) { 
  var timer = opt_timer || new goog.Timer(50); 
  var deferred = new goog.async.Deferred(goog.partial(goog.dispose, timer)); 
  timer.start(); 
  goog.events.listen(timer, goog.Timer.TICK, function() { 
    var channel = new MessageChannel(); 
    var gotMessage = function(e) { 
      channel.port1.removeEventListener(goog.events.EventType.MESSAGE, gotMessage, true); 
      if(! timer.isDisposed()) { 
        deferred.callback(new goog.messaging.PortChannel(channel.port1)); 
      } 
    }; 
    channel.port1.start(); 
    channel.port1.addEventListener(goog.events.EventType.MESSAGE, gotMessage, true); 
    var msg = { }; 
    msg[goog.messaging.PortChannel.FLAG]= true; 
    window.postMessage(msg,[channel.port2], peerOrigin); 
  }); 
  return new goog.messaging.DeferredChannel(deferred); 
}; 
goog.messaging.PortChannel.forGlobalWindow = function(peerOrigin) { 
  var deferred = new goog.async.Deferred(); 
  var key = goog.events.listen(window, goog.events.EventType.MESSAGE, function(e) { 
    var browserEvent = e.getBrowserEvent(); 
    var data = browserEvent.data; 
    if(! goog.isObject(data) || ! data[goog.messaging.PortChannel.FLAG]) { 
      return; 
    } 
    if(peerOrigin != '*' && peerOrigin != browserEvent.origin) { 
      return; 
    } 
    var port = browserEvent.ports[0]; 
    port.postMessage({ }); 
    port.start(); 
    deferred.callback(new goog.messaging.PortChannel(port)); 
    goog.events.unlistenByKey(key); 
  }); 
  return new goog.messaging.DeferredChannel(deferred); 
}; 
goog.messaging.PortChannel.FLAG = '--goog.messaging.PortChannel'; 
goog.messaging.PortChannel.REQUIRES_SERIALIZATION_ = goog.userAgent.WEBKIT && goog.string.compareVersions(goog.userAgent.VERSION, '533') < 0; 
goog.messaging.PortChannel.prototype.logger = goog.debug.Logger.getLogger('goog.messaging.PortChannel'); 
goog.messaging.PortChannel.prototype.send = function(serviceName, payload) { 
  var ports =[]; 
  payload = this.extractPorts_(ports, payload); 
  var message = { 
    'serviceName': serviceName, 
    'payload': payload 
  }; 
  message[goog.messaging.PortChannel.FLAG]= true; 
  if(goog.messaging.PortChannel.REQUIRES_SERIALIZATION_) { 
    message = goog.json.serialize(message); 
  } 
  this.port_.postMessage(message, ports); 
}; 
goog.messaging.PortChannel.prototype.deliver_ = function(e) { 
  var browserEvent = e.getBrowserEvent(); 
  var data = browserEvent.data; 
  if(goog.messaging.PortChannel.REQUIRES_SERIALIZATION_) { 
    try { 
      data = goog.json.parse(data); 
    } catch(error) { 
      return; 
    } 
  } 
  if(! goog.isObject(data) || ! data[goog.messaging.PortChannel.FLAG]) { 
    return; 
  } 
  if(this.validateMessage_(data)) { 
    var serviceName = data['serviceName']; 
    var payload = data['payload']; 
    var service = this.getService(serviceName, payload); 
    if(! service) { 
      return; 
    } 
    payload = this.decodePayload(serviceName, this.injectPorts_(browserEvent.ports ||[], payload), service.objectPayload); 
    if(goog.isDefAndNotNull(payload)) { 
      service.callback(payload); 
    } 
  } 
}; 
goog.messaging.PortChannel.prototype.validateMessage_ = function(data) { 
  if(!('serviceName' in data)) { 
    this.logger.warning('Message object doesn\'t contain service name: ' + goog.debug.deepExpose(data)); 
    return false; 
  } 
  if(!('payload' in data)) { 
    this.logger.warning('Message object doesn\'t contain payload: ' + goog.debug.deepExpose(data)); 
    return false; 
  } 
  return true; 
}; 
goog.messaging.PortChannel.prototype.extractPorts_ = function(ports, message) { 
  if(message && Object.prototype.toString.call((message)) == '[object MessagePort]') { 
    ports.push(message); 
    return { '_port': { 
        'type': 'real', 
        'index': ports.length - 1 
      } }; 
  } else if(goog.isArray(message)) { 
    return goog.array.map(message, goog.bind(this.extractPorts_, this, ports)); 
  } else if(message && message.constructor == Object) { 
    return goog.object.map((message), function(val, key) { 
      val = this.extractPorts_(ports, val); 
      return key == '_port' ? { 
        'type': 'escaped', 
        'val': val 
      }: val; 
    }, this); 
  } else { 
    return message; 
  } 
}; 
goog.messaging.PortChannel.prototype.injectPorts_ = function(ports, message) { 
  if(goog.isArray(message)) { 
    return goog.array.map(message, goog.bind(this.injectPorts_, this, ports)); 
  } else if(message && message.constructor == Object) { 
    message =(message); 
    if(message['_port']&& message['_port']['type']== 'real') { 
      return(ports[message['_port']['index']]); 
    } 
    return goog.object.map(message, function(val, key) { 
      return this.injectPorts_(ports, key == '_port' ? val['val']: val); 
    }, this); 
  } else { 
    return message; 
  } 
}; 
goog.messaging.PortChannel.prototype.disposeInternal = function() { 
  goog.events.unlistenByKey(this.listenerKey_); 
  if(Object.prototype.toString.call(this.port_) == '[object MessagePort]') { 
    this.port_.close(); 
  } else if(Object.prototype.toString.call(this.port_) == '[object Worker]') { 
    this.port_.terminate(); 
  } 
  delete this.port_; 
  goog.base(this, 'disposeInternal'); 
}; 

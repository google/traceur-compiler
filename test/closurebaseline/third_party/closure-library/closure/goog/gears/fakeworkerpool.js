
goog.provide('goog.gears.FakeWorkerPool'); 
goog.require('goog.Uri'); 
goog.require('goog.gears'); 
goog.require('goog.gears.WorkerPool'); 
goog.require('goog.net.XmlHttp'); 
goog.gears.FakeWorkerPool_ = function() { 
  this.frameNames_ = { }; 
}; 
goog.gears.FakeWorkerPool_.idCounter_ = 1; 
goog.gears.FakeWorkerPool_.mainWorkerId_ = 0; 
goog.gears.FakeWorkerPool_.prototype.createWorkerFromUrl = function(url) { 
  var xhr = new goog.net.XmlHttp(); 
  xhr.open('GET', url, false); 
  xhr.send(null); 
  return this.createWorker(xhr.responseText); 
}; 
goog.gears.FakeWorkerPool_.prototype.createWorker = function(code) { 
  var win = goog.getObjectByName('window'); 
  var doc = win.document; 
  var iframeElement = doc.createElement('iframe'); 
  var id = goog.gears.FakeWorkerPool_.idCounter_ ++; 
  var name = iframeElement.name = iframeElement.id = 'fake-worker-' + id; 
  doc.body.appendChild(iframeElement); 
  var w = win.frames[name]; 
  this.frameNames_[id]= name; 
  var selfObj = this; 
  var fakeGearsWorkerPool = { 
    'sendMessage': function(message, toId) { 
      w.setTimeout(function() { 
        selfObj.routeMessage_(message, id, toId); 
      }, 1); 
    }, 
    'allowCrossOrigin': function() { } 
  }; 
  doc = w.document; 
  doc.open(); 
  w['google']= { 'gears': { 
      'workerPool': fakeGearsWorkerPool, 
      'factory': goog.gears.getFactory() 
    } }; 
  doc.write('<script>with ({window: undefined, document: undefined, ' + 'navigator: undefined}) {' + code + '}</' + 'script>'); 
  doc.close(); 
  return id; 
}; 
goog.gears.FakeWorkerPool_.prototype.allowCrossOrigin = function() { }; 
goog.gears.FakeWorkerPool_.prototype.sendMessage = function(message, workerId) { 
  var w = this.getWindow_(workerId); 
  var messageObject = this.createMessageObject_(message, workerId); 
  w.setTimeout(function() { 
    w['google']['gears']['workerPool'].onmessage(String(message), goog.gears.FakeWorkerPool_.mainWorkerId_, messageObject); 
  }, 1); 
}; 
goog.gears.FakeWorkerPool_.prototype.onmessage = function(message, sender, opt_messageObject) { }; 
goog.gears.FakeWorkerPool_.prototype.routeMessage_ = function(message, fromId, toId) { 
  var messageObject = this.createMessageObject_(message, fromId); 
  if(toId == goog.gears.FakeWorkerPool_.mainWorkerId_) { 
    this.onmessage(message, fromId, messageObject); 
  } else { 
    var w = this.getWindow_(toId); 
    w['google']['gears']['workerPool'].onmessage(message, fromId, messageObject); 
  } 
}; 
goog.gears.FakeWorkerPool_.prototype.createMessageObject_ = function(text, sender) { 
  var uri = new goog.Uri(goog.getObjectByName('window').location); 
  var port = uri.getPort(); 
  var origin = uri.getScheme() + '://' + uri.getDomain() +(uri.hasPort() && port != 80 && port != 443 ? ':' + uri.getPort(): ''); 
  return { 
    'text': text, 
    'sender': sender, 
    'origin': origin, 
    'body': text 
  }; 
}; 
goog.gears.FakeWorkerPool_.prototype.getWindow_ = function(workerId) { 
  var frameName = this.frameNames_[workerId]; 
  if(frameName) { 
    var w = goog.getObjectByName('window.frames')[frameName]; 
    if(w) return w; 
  } 
  throw Error('Could not access worker'); 
}; 
goog.gears.FakeWorkerPool = function() { 
  goog.gears.WorkerPool.call(this); 
}; 
goog.inherits(goog.gears.FakeWorkerPool, goog.gears.WorkerPool); 
goog.gears.FakeWorkerPool.prototype.getGearsWorkerPool = function() { 
  return new goog.gears.FakeWorkerPool_; 
}; 

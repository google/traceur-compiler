
goog.provide('goog.net.CrossDomainRpc'); 
goog.require('goog.Uri.QueryData'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.events.EventType'); 
goog.require('goog.json'); 
goog.require('goog.net.EventType'); 
goog.require('goog.net.HttpStatus'); 
goog.require('goog.userAgent'); 
goog.net.CrossDomainRpc = function() { 
  goog.events.EventTarget.call(this); 
}; 
goog.inherits(goog.net.CrossDomainRpc, goog.events.EventTarget); 
goog.net.CrossDomainRpc.RESPONSE_MARKER_ = 'xdrp'; 
goog.net.CrossDomainRpc.useFallBackDummyResource_ = true; 
goog.net.CrossDomainRpc.isInResponseIframe_ = function() { 
  return window.location &&(window.location.hash.indexOf(goog.net.CrossDomainRpc.RESPONSE_MARKER_) == 1 || window.location.search.indexOf(goog.net.CrossDomainRpc.RESPONSE_MARKER_) == 1); 
}; 
if(goog.net.CrossDomainRpc.isInResponseIframe_()) { 
  if(goog.userAgent.IE) { 
    document.execCommand('Stop'); 
  } else if(goog.userAgent.GECKO) { 
    window.stop(); 
  } else { 
    throw Error('stopped'); 
  } 
} 
goog.net.CrossDomainRpc.setDummyResourceUri = function(dummyResourceUri) { 
  goog.net.CrossDomainRpc.dummyResourceUri_ = dummyResourceUri; 
}; 
goog.net.CrossDomainRpc.setUseFallBackDummyResource = function(useFallBack) { 
  goog.net.CrossDomainRpc.useFallBackDummyResource_ = useFallBack; 
}; 
goog.net.CrossDomainRpc.send = function(uri, opt_continuation, opt_method, opt_params, opt_headers) { 
  var xdrpc = new goog.net.CrossDomainRpc(); 
  if(opt_continuation) { 
    goog.events.listen(xdrpc, goog.net.EventType.COMPLETE, opt_continuation); 
  } 
  goog.events.listen(xdrpc, goog.net.EventType.READY, xdrpc.reset); 
  xdrpc.sendRequest(uri, opt_method, opt_params, opt_headers); 
}; 
goog.net.CrossDomainRpc.setDebugMode = function(flag) { 
  goog.net.CrossDomainRpc.debugMode_ = flag; 
}; 
goog.net.CrossDomainRpc.logger_ = goog.debug.Logger.getLogger('goog.net.CrossDomainRpc'); 
goog.net.CrossDomainRpc.createInputHtml_ = function(name, value) { 
  return '<textarea name="' + name + '">' + goog.net.CrossDomainRpc.escapeAmpersand_(value) + '</textarea>'; 
}; 
goog.net.CrossDomainRpc.escapeAmpersand_ = function(value) { 
  return value &&(goog.isString(value) || value.constructor == String) ? value.replace(/&/g, '&amp;'): value; 
}; 
goog.net.CrossDomainRpc.getDummyResourceUri_ = function() { 
  if(goog.net.CrossDomainRpc.dummyResourceUri_) { 
    return goog.net.CrossDomainRpc.dummyResourceUri_; 
  } 
  if(goog.userAgent.GECKO) { 
    var links = document.getElementsByTagName('link'); 
    for(var i = 0; i < links.length; i ++) { 
      var link = links[i]; 
      if(link.rel == 'stylesheet' && goog.Uri.haveSameDomain(link.href, window.location.href) && link.href.indexOf('?') < 0) { 
        return goog.net.CrossDomainRpc.removeHash_(link.href); 
      } 
    } 
  } 
  var images = document.getElementsByTagName('img'); 
  for(var i = 0; i < images.length; i ++) { 
    var image = images[i]; 
    if(goog.Uri.haveSameDomain(image.src, window.location.href) && image.src.indexOf('?') < 0) { 
      return goog.net.CrossDomainRpc.removeHash_(image.src); 
    } 
  } 
  if(! goog.net.CrossDomainRpc.useFallBackDummyResource_) { 
    throw Error('No suitable dummy resource specified or detected for this page'); 
  } 
  if(goog.userAgent.IE) { 
    return goog.net.CrossDomainRpc.removeHash_(window.location.href); 
  } else { 
    var locationHref = window.location.href; 
    var rootSlash = locationHref.indexOf('/', locationHref.indexOf('//') + 2); 
    var rootHref = locationHref.substring(0, rootSlash); 
    return rootHref + '/robots.txt'; 
  } 
}; 
goog.net.CrossDomainRpc.removeHash_ = function(uri) { 
  return uri.split('#')[0]; 
}; 
goog.net.CrossDomainRpc.nextRequestId_ = 0; 
goog.net.CrossDomainRpc.HEADER = 'xdh:'; 
goog.net.CrossDomainRpc.PARAM = 'xdp:'; 
goog.net.CrossDomainRpc.PARAM_ECHO = 'xdpe:'; 
goog.net.CrossDomainRpc.PARAM_ECHO_REQUEST_ID = goog.net.CrossDomainRpc.PARAM_ECHO + 'request-id'; 
goog.net.CrossDomainRpc.PARAM_ECHO_DUMMY_URI = goog.net.CrossDomainRpc.PARAM_ECHO + 'dummy-uri'; 
goog.net.CrossDomainRpc.REQUEST_MARKER_ = 'xdrq'; 
goog.net.CrossDomainRpc.prototype.sendRequest = function(uri, opt_method, opt_params, opt_headers) { 
  var requestFrame = this.requestFrame_ = document.createElement('iframe'); 
  var requestId = goog.net.CrossDomainRpc.nextRequestId_ ++; 
  requestFrame.id = goog.net.CrossDomainRpc.REQUEST_MARKER_ + '-' + requestId; 
  if(! goog.net.CrossDomainRpc.debugMode_) { 
    requestFrame.style.position = 'absolute'; 
    requestFrame.style.top = '-5000px'; 
    requestFrame.style.left = '-5000px'; 
  } 
  document.body.appendChild(requestFrame); 
  var inputs =[]; 
  inputs.push(goog.net.CrossDomainRpc.createInputHtml_(goog.net.CrossDomainRpc.PARAM_ECHO_REQUEST_ID, requestId)); 
  var dummyUri = goog.net.CrossDomainRpc.getDummyResourceUri_(); 
  goog.net.CrossDomainRpc.logger_.log(goog.debug.Logger.Level.FINE, 'dummyUri: ' + dummyUri); 
  inputs.push(goog.net.CrossDomainRpc.createInputHtml_(goog.net.CrossDomainRpc.PARAM_ECHO_DUMMY_URI, dummyUri)); 
  if(opt_params) { 
    for(var name in opt_params) { 
      var value = opt_params[name]; 
      inputs.push(goog.net.CrossDomainRpc.createInputHtml_(goog.net.CrossDomainRpc.PARAM + name, value)); 
    } 
  } 
  if(opt_headers) { 
    for(var name in opt_headers) { 
      var value = opt_headers[name]; 
      inputs.push(goog.net.CrossDomainRpc.createInputHtml_(goog.net.CrossDomainRpc.HEADER + name, value)); 
    } 
  } 
  var requestFrameContent = '<body><form method="' +(opt_method == 'GET' ? 'GET': 'POST') + '" action="' + uri + '">' + inputs.join('') + '</form></body>'; 
  var requestFrameDoc = goog.dom.getFrameContentDocument(requestFrame); 
  requestFrameDoc.open(); 
  requestFrameDoc.write(requestFrameContent); 
  requestFrameDoc.close(); 
  requestFrameDoc.forms[0].submit(); 
  requestFrameDoc = null; 
  this.loadListenerKey_ = goog.events.listen(requestFrame, goog.events.EventType.LOAD, function() { 
    goog.net.CrossDomainRpc.logger_.log(goog.debug.Logger.Level.FINE, 'response ready'); 
    this.responseReady_ = true; 
  }, false, this); 
  this.receiveResponse_(); 
}; 
goog.net.CrossDomainRpc.RESPONSE_POLLING_PERIOD_ = 50; 
goog.net.CrossDomainRpc.SEND_RESPONSE_TIME_OUT_ = 500; 
goog.net.CrossDomainRpc.prototype.receiveResponse_ = function() { 
  this.timeWaitedAfterResponseReady_ = 0; 
  var responseDetectorHandle = window.setInterval(goog.bind(function() { 
    this.detectResponse_(responseDetectorHandle); 
  }, this), goog.net.CrossDomainRpc.RESPONSE_POLLING_PERIOD_); 
}; 
goog.net.CrossDomainRpc.prototype.detectResponse_ = function(responseDetectorHandle) { 
  var requestFrameWindow = this.requestFrame_.contentWindow; 
  var grandChildrenLength = requestFrameWindow.frames.length; 
  var responseInfoFrame = null; 
  if(grandChildrenLength > 0 && goog.net.CrossDomainRpc.isResponseInfoFrame_(responseInfoFrame = requestFrameWindow.frames[grandChildrenLength - 1])) { 
    goog.net.CrossDomainRpc.logger_.log(goog.debug.Logger.Level.FINE, 'xd response ready'); 
    var responseInfoPayload = goog.net.CrossDomainRpc.getFramePayload_(responseInfoFrame).substring(1); 
    var params = new goog.Uri.QueryData(responseInfoPayload); 
    var chunks =[]; 
    var numChunks = Number(params.get('n')); 
    goog.net.CrossDomainRpc.logger_.log(goog.debug.Logger.Level.FINE, 'xd response number of chunks: ' + numChunks); 
    for(var i = 0; i < numChunks; i ++) { 
      var responseFrame = requestFrameWindow.frames[i]; 
      if(! responseFrame || ! responseFrame.location || ! responseFrame.location.href) { 
        goog.net.CrossDomainRpc.logger_.log(goog.debug.Logger.Level.FINE, 'xd response iframe not ready'); 
        return; 
      } 
      var responseChunkPayload = goog.net.CrossDomainRpc.getFramePayload_(responseFrame); 
      var chunkIndex = responseChunkPayload.indexOf(goog.net.CrossDomainRpc.PARAM_CHUNK_) + goog.net.CrossDomainRpc.PARAM_CHUNK_.length + 1; 
      var chunk = responseChunkPayload.substring(chunkIndex); 
      chunks.push(chunk); 
    } 
    window.clearInterval(responseDetectorHandle); 
    var responseData = chunks.join(''); 
    if(! goog.userAgent.IE) { 
      responseData = decodeURIComponent(responseData); 
    } 
    this.status = Number(params.get('status')); 
    this.responseText = responseData; 
    this.responseTextIsJson_ = params.get('isDataJson') == 'true'; 
    this.responseHeaders = goog.json.unsafeParse((params.get('headers'))); 
    this.dispatchEvent(goog.net.EventType.READY); 
    this.dispatchEvent(goog.net.EventType.COMPLETE); 
  } else { 
    if(this.responseReady_) { 
      this.timeWaitedAfterResponseReady_ += goog.net.CrossDomainRpc.RESPONSE_POLLING_PERIOD_; 
      if(this.timeWaitedAfterResponseReady_ > goog.net.CrossDomainRpc.SEND_RESPONSE_TIME_OUT_) { 
        goog.net.CrossDomainRpc.logger_.log(goog.debug.Logger.Level.FINE, 'xd response timed out'); 
        window.clearInterval(responseDetectorHandle); 
        this.status = goog.net.HttpStatus.INTERNAL_SERVER_ERROR; 
        this.responseText = 'response timed out'; 
        this.dispatchEvent(goog.net.EventType.READY); 
        this.dispatchEvent(goog.net.EventType.ERROR); 
        this.dispatchEvent(goog.net.EventType.COMPLETE); 
      } 
    } 
  } 
}; 
goog.net.CrossDomainRpc.isResponseInfoFrame_ = function(frame) { 
  try { 
    return goog.net.CrossDomainRpc.getFramePayload_(frame).indexOf(goog.net.CrossDomainRpc.RESPONSE_INFO_MARKER_) == 1; 
  } catch(e) { 
    return false; 
  } 
}; 
goog.net.CrossDomainRpc.getFramePayload_ = function(frame) { 
  var href = frame.location.href; 
  var question = href.indexOf('?'); 
  var hash = href.indexOf('#'); 
  var delimiter = question < 0 ? hash: hash < 0 ? question: Math.min(question, hash); 
  return href.substring(delimiter); 
}; 
goog.net.CrossDomainRpc.prototype.getResponseJson = function() { 
  return this.responseTextIsJson_ ? goog.json.unsafeParse(this.responseText): undefined; 
}; 
goog.net.CrossDomainRpc.prototype.isSuccess = function() { 
  switch(this.status) { 
    case goog.net.HttpStatus.OK: 
    case goog.net.HttpStatus.NOT_MODIFIED: 
      return true; 

    default: 
      return false; 

  } 
}; 
goog.net.CrossDomainRpc.prototype.reset = function() { 
  if(! goog.net.CrossDomainRpc.debugMode_) { 
    goog.net.CrossDomainRpc.logger_.log(goog.debug.Logger.Level.FINE, 'request frame removed: ' + this.requestFrame_.id); 
    goog.events.unlistenByKey(this.loadListenerKey_); 
    this.requestFrame_.parentNode.removeChild(this.requestFrame_); 
  } 
  delete this.requestFrame_; 
}; 
goog.net.CrossDomainRpc.RESPONSE_INFO_MARKER_ = goog.net.CrossDomainRpc.RESPONSE_MARKER_ + '-info'; 
goog.net.CrossDomainRpc.MAX_CHUNK_SIZE_ = goog.userAgent.IE ? 4095: 1024 * 1024; 
goog.net.CrossDomainRpc.PARAM_CHUNK_ = 'chunk'; 
goog.net.CrossDomainRpc.CHUNK_PREFIX_ = goog.net.CrossDomainRpc.RESPONSE_MARKER_ + '=1&' + goog.net.CrossDomainRpc.PARAM_CHUNK_ + '='; 
goog.net.CrossDomainRpc.sendResponse = function(data, isDataJson, echo, status, headers) { 
  var dummyUri = echo[goog.net.CrossDomainRpc.PARAM_ECHO_DUMMY_URI]; 
  if(! goog.string.caseInsensitiveStartsWith(dummyUri, 'http://') && ! goog.string.caseInsensitiveStartsWith(dummyUri, 'https://')) { 
    dummyUri = 'http://' + dummyUri; 
  } 
  var chunkSize = goog.net.CrossDomainRpc.MAX_CHUNK_SIZE_ - dummyUri.length - 1 - goog.net.CrossDomainRpc.CHUNK_PREFIX_.length - 1; 
  if(! goog.userAgent.IE) { 
    data = encodeURIComponent(data); 
  } 
  var numChunksToSend = Math.ceil(data.length / chunkSize); 
  if(numChunksToSend == 0) { 
    goog.net.CrossDomainRpc.createResponseInfo_(dummyUri, numChunksToSend, isDataJson, status, headers); 
  } else { 
    try { 
      throw undefined; 
    } catch(checkToCreateResponseInfo_) { 
      var numChunksSent = 0; 
      (checkToCreateResponseInfo_ = function checkToCreateResponseInfo_() { 
        if(++ numChunksSent == numChunksToSend) { 
          goog.net.CrossDomainRpc.createResponseInfo_(dummyUri, numChunksToSend, isDataJson, status, headers); 
        } 
      }); 
      for(var i = 0; i < numChunksToSend; i ++) { 
        var chunkStart = i * chunkSize; 
        var chunkEnd = chunkStart + chunkSize; 
        var chunk = chunkEnd > data.length ? data.substring(chunkStart): data.substring(chunkStart, chunkEnd); 
        var responseFrame = document.createElement('iframe'); 
        responseFrame.src = dummyUri + goog.net.CrossDomainRpc.getPayloadDelimiter_(dummyUri) + goog.net.CrossDomainRpc.CHUNK_PREFIX_ + chunk; 
        document.body.appendChild(responseFrame); 
        checkToCreateResponseInfo_(); 
      } 
    } 
  } 
}; 
goog.net.CrossDomainRpc.createResponseInfo_ = function(dummyUri, numChunks, isDataJson, status, headers) { 
  var responseInfoFrame = document.createElement('iframe'); 
  document.body.appendChild(responseInfoFrame); 
  responseInfoFrame.src = dummyUri + goog.net.CrossDomainRpc.getPayloadDelimiter_(dummyUri) + goog.net.CrossDomainRpc.RESPONSE_INFO_MARKER_ + '=1&n=' + numChunks + '&isDataJson=' + isDataJson + '&status=' + status + '&headers=' + encodeURIComponent(headers); 
}; 
goog.net.CrossDomainRpc.getPayloadDelimiter_ = function(dummyUri) { 
  return goog.net.CrossDomainRpc.REFERRER_ == dummyUri ? '?': '#'; 
}; 
goog.net.CrossDomainRpc.removeUriParams_ = function(uri) { 
  var question = uri.indexOf('?'); 
  if(question > 0) { 
    uri = uri.substring(0, question); 
  } 
  var hash = uri.indexOf('#'); 
  if(hash > 0) { 
    uri = uri.substring(0, hash); 
  } 
  return uri; 
}; 
goog.net.CrossDomainRpc.prototype.getResponseHeader = function(name) { 
  return goog.isObject(this.responseHeaders) ? this.responseHeaders[name]: undefined; 
}; 
goog.net.CrossDomainRpc.REFERRER_ = goog.net.CrossDomainRpc.removeUriParams_(document.referrer); 

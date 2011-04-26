
goog.provide('goog.net.ChannelRequest'); 
goog.provide('goog.net.ChannelRequest.Error'); 
goog.require('goog.Timer'); 
goog.require('goog.events'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.net.EventType'); 
goog.require('goog.net.XmlHttp.ReadyState'); 
goog.require('goog.object'); 
goog.require('goog.userAgent'); 
goog.net.ChannelRequest = function(channel, channelDebug, opt_sessionId, opt_requestId, opt_retryId) { 
  this.channel_ = channel; 
  this.channelDebug_ = channelDebug; 
  this.sid_ = opt_sessionId; 
  this.rid_ = opt_requestId; 
  this.retryId_ = opt_retryId || 1; 
  this.timeout_ = goog.net.ChannelRequest.TIMEOUT_MS; 
  this.eventHandler_ = new goog.events.EventHandler(this); 
  this.pollingTimer_ = new goog.Timer(); 
  this.pollingTimer_.setInterval(goog.net.ChannelRequest.POLLING_INTERVAL_MS); 
}; 
goog.net.ChannelRequest.prototype.extraHeaders_ = null; 
goog.net.ChannelRequest.prototype.successful_ = false; 
goog.net.ChannelRequest.prototype.watchDogTimerId_ = null; 
goog.net.ChannelRequest.prototype.watchDogTimeoutTime_ = null; 
goog.net.ChannelRequest.prototype.requestStartTime_ = null; 
goog.net.ChannelRequest.prototype.type_ = null; 
goog.net.ChannelRequest.prototype.baseUri_ = null; 
goog.net.ChannelRequest.prototype.requestUri_ = null; 
goog.net.ChannelRequest.prototype.postData_ = null; 
goog.net.ChannelRequest.prototype.xmlHttp_ = null; 
goog.net.ChannelRequest.prototype.xmlHttpChunkStart_ = 0; 
goog.net.ChannelRequest.prototype.trident_ = null; 
goog.net.ChannelRequest.prototype.verb_ = null; 
goog.net.ChannelRequest.prototype.lastError_ = null; 
goog.net.ChannelRequest.prototype.lastStatusCode_ = - 1; 
goog.net.ChannelRequest.prototype.sendClose_ = true; 
goog.net.ChannelRequest.prototype.cancelled_ = false; 
goog.net.ChannelRequest.TIMEOUT_MS = 45 * 1000; 
goog.net.ChannelRequest.POLLING_INTERVAL_MS = 250; 
goog.net.ChannelRequest.MIN_WEBKIT_FOR_INTERACTIVE_ = '420+'; 
goog.net.ChannelRequest.Type_ = { 
  XML_HTTP: 1, 
  IMG: 2, 
  TRIDENT: 3 
}; 
goog.net.ChannelRequest.Error = { 
  STATUS: 0, 
  NO_DATA: 1, 
  TIMEOUT: 2, 
  UNKNOWN_SESSION_ID: 3, 
  BAD_DATA: 4, 
  HANDLER_EXCEPTION: 5 
}; 
goog.net.ChannelRequest.errorStringFromCode = function(errorCode, statusCode) { 
  switch(errorCode) { 
    case goog.net.ChannelRequest.Error.STATUS: 
      return 'Non-200 return code (' + statusCode + ')'; 

    case goog.net.ChannelRequest.Error.NO_DATA: 
      return 'XMLHTTP failure (no data)'; 

    case goog.net.ChannelRequest.Error.TIMEOUT: 
      return 'HttpConnection timeout'; 

    default: 
      return 'Unknown error'; 

  } 
}; 
goog.net.ChannelRequest.INVALID_CHUNK_ = { }; 
goog.net.ChannelRequest.INCOMPLETE_CHUNK_ = { }; 
goog.net.ChannelRequest.prototype.setExtraHeaders = function(extraHeaders) { 
  this.extraHeaders_ = extraHeaders; 
}; 
goog.net.ChannelRequest.prototype.setTimeout = function(timeout) { 
  this.timeout_ = timeout; 
}; 
goog.net.ChannelRequest.prototype.xmlHttpPost = function(uri, postData, decodeChunks) { 
  this.type_ = goog.net.ChannelRequest.Type_.XML_HTTP; 
  this.baseUri_ = uri.clone().makeUnique(); 
  this.postData_ = postData; 
  this.decodeChunks_ = decodeChunks; 
  this.sendXmlHttp_(null); 
}; 
goog.net.ChannelRequest.prototype.xmlHttpGet = function(uri, decodeChunks, hostPrefix, opt_noClose) { 
  this.type_ = goog.net.ChannelRequest.Type_.XML_HTTP; 
  this.baseUri_ = uri.clone().makeUnique(); 
  this.postData_ = null; 
  this.decodeChunks_ = decodeChunks; 
  if(opt_noClose) { 
    this.sendClose_ = false; 
  } 
  this.sendXmlHttp_(hostPrefix); 
}; 
goog.net.ChannelRequest.prototype.sendXmlHttp_ = function(hostPrefix) { 
  this.requestUri_ = this.baseUri_.clone(); 
  this.requestUri_.setParameterValues('t', this.retryId_); 
  this.xmlHttpChunkStart_ = 0; 
  var useSecondaryDomains = this.channel_.shouldUseSecondaryDomains(); 
  this.xmlHttp_ = this.channel_.createXhrIo(useSecondaryDomains ? hostPrefix: null); 
  goog.events.listen(this.xmlHttp_, goog.net.EventType.READY_STATE_CHANGE, this.xmlHttpHandler_, false, this); 
  var headers = this.extraHeaders_ ? goog.object.clone(this.extraHeaders_): { }; 
  if(this.postData_) { 
    this.verb_ = 'POST'; 
    headers['Content-Type']= 'application/x-www-form-urlencoded'; 
    this.xmlHttp_.send(this.requestUri_, this.verb_, this.postData_, headers); 
  } else { 
    this.verb_ = 'GET'; 
    if(this.sendClose_ && ! goog.userAgent.WEBKIT) { 
      headers['Connection']= 'close'; 
    } 
    this.xmlHttp_.send(this.requestUri_, this.verb_, null, headers); 
  } 
  this.requestStartTime_ = goog.now(); 
  this.channelDebug_.xmlHttpChannelRequest(this.verb_, this.requestUri_, this.rid_, this.retryId_, this.postData_); 
  this.ensureWatchDogTimer_(); 
}; 
goog.net.ChannelRequest.prototype.xmlHttpHandler_ = function(e) { 
  var xmlhttp = e.target; 
  goog.net.BrowserChannel.onStartExecution(); 
  try { 
    if(xmlhttp == this.xmlHttp_) { 
      this.onXmlHttpReadyStateChanged_(); 
    } else { 
      this.channelDebug_.warning('Called back with an ' + 'unexpected xmlhttp'); 
    } 
  } catch(ex) { 
    this.channelDebug_.debug('Failed call to OnXmlHttpReadyStateChanged_'); 
    if(this.xmlHttp_ && this.xmlHttp_.getResponseText()) { 
      this.channelDebug_.dumpException(ex, 'ResponseText: ' + this.xmlHttp_.getResponseText()); 
    } else { 
      this.channelDebug_.dumpException(ex, 'No response text'); 
    } 
  } finally { 
    goog.net.BrowserChannel.onEndExecution(); 
  } 
}; 
goog.net.ChannelRequest.prototype.onXmlHttpReadyStateChanged_ = function() { 
  var readyState = this.xmlHttp_.getReadyState(); 
  if(goog.userAgent.IE ||(goog.userAgent.WEBKIT && ! goog.userAgent.isVersion(goog.net.ChannelRequest.MIN_WEBKIT_FOR_INTERACTIVE_))) { 
    if(readyState < goog.net.XmlHttp.ReadyState.COMPLETE) { 
      return; 
    } 
  } else { 
    if(readyState < goog.net.XmlHttp.ReadyState.INTERACTIVE || readyState == goog.net.XmlHttp.ReadyState.INTERACTIVE && ! goog.userAgent.OPERA && ! this.xmlHttp_.getResponseText()) { 
      return; 
    } 
  } 
  this.cancelWatchDogTimer_(); 
  var status = this.xmlHttp_.getStatus(); 
  this.lastStatusCode_ = status; 
  var responseText = this.xmlHttp_.getResponseText(); 
  if(! responseText) { 
    this.channelDebug_.debug('No response text for uri ' + this.requestUri_ + ' status ' + status); 
  } 
  this.successful_ =(status == 200); 
  this.channelDebug_.xmlHttpChannelResponseMetaData((this.verb_), this.requestUri_, this.rid_, this.retryId_, readyState, status); 
  if(! this.successful_) { 
    if(status == 400 && responseText.indexOf('Unknown SID') > 0) { 
      this.lastError_ = goog.net.ChannelRequest.Error.UNKNOWN_SESSION_ID; 
      goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.REQUEST_UNKNOWN_SESSION_ID); 
    } else { 
      this.lastError_ = goog.net.ChannelRequest.Error.STATUS; 
      goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.REQUEST_BAD_STATUS); 
    } 
    this.channelDebug_.xmlHttpChannelResponseText(this.rid_, responseText); 
    this.cleanup_(); 
    this.dispatchFailure_(); 
    return; 
  } 
  if(readyState == goog.net.XmlHttp.ReadyState.COMPLETE) { 
    this.cleanup_(); 
  } 
  if(this.decodeChunks_) { 
    this.decodeNextChunks_(readyState, responseText); 
    if(goog.userAgent.OPERA && readyState == goog.net.XmlHttp.ReadyState.INTERACTIVE) { 
      this.startPolling_(); 
    } 
  } else { 
    this.channelDebug_.xmlHttpChannelResponseText(this.rid_, responseText, null); 
    this.safeOnRequestData_(responseText); 
  } 
  if(! this.successful_) { 
    return; 
  } 
  if(! this.cancelled_) { 
    if(readyState == goog.net.XmlHttp.ReadyState.COMPLETE) { 
      this.channel_.onRequestComplete(this); 
    } else { 
      this.successful_ = false; 
      this.ensureWatchDogTimer_(); 
    } 
  } 
}; 
goog.net.ChannelRequest.prototype.decodeNextChunks_ = function(readyState, responseText) { 
  var decodeNextChunksSuccessful = true; 
  while(! this.cancelled_ && this.xmlHttpChunkStart_ < responseText.length) { 
    var chunkText = this.getNextChunk_(responseText); 
    if(chunkText == goog.net.ChannelRequest.INCOMPLETE_CHUNK_) { 
      if(readyState == goog.net.XmlHttp.ReadyState.COMPLETE) { 
        this.lastError_ = goog.net.ChannelRequest.Error.BAD_DATA; 
        goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.REQUEST_INCOMPLETE_DATA); 
        decodeNextChunksSuccessful = false; 
      } 
      this.channelDebug_.xmlHttpChannelResponseText(this.rid_, null, '[Incomplete Response]'); 
      break; 
    } else if(chunkText == goog.net.ChannelRequest.INVALID_CHUNK_) { 
      this.lastError_ = goog.net.ChannelRequest.Error.BAD_DATA; 
      goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.REQUEST_BAD_DATA); 
      this.channelDebug_.xmlHttpChannelResponseText(this.rid_, responseText, '[Invalid Chunk]'); 
      decodeNextChunksSuccessful = false; 
      break; 
    } else { 
      this.channelDebug_.xmlHttpChannelResponseText(this.rid_,(chunkText), null); 
      this.safeOnRequestData_((chunkText)); 
    } 
  } 
  if(readyState == goog.net.XmlHttp.ReadyState.COMPLETE && responseText.length == 0) { 
    this.lastError_ = goog.net.ChannelRequest.Error.NO_DATA; 
    goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.REQUEST_NO_DATA); 
    decodeNextChunksSuccessful = false; 
  } 
  this.successful_ = this.successful_ && decodeNextChunksSuccessful; 
  if(! decodeNextChunksSuccessful) { 
    this.channelDebug_.xmlHttpChannelResponseText(this.rid_, responseText, '[Invalid Chunked Response]'); 
    this.cleanup_(); 
    this.dispatchFailure_(); 
  } 
}; 
goog.net.ChannelRequest.prototype.pollResponse_ = function() { 
  var readyState = this.xmlHttp_.getReadyState(); 
  var responseText = this.xmlHttp_.getResponseText(); 
  if(this.xmlHttpChunkStart_ < responseText.length) { 
    this.cancelWatchDogTimer_(); 
    this.decodeNextChunks_(readyState, responseText); 
    if(this.successful_ && readyState != goog.net.XmlHttp.ReadyState.COMPLETE) { 
      this.ensureWatchDogTimer_(); 
    } 
  } 
}; 
goog.net.ChannelRequest.prototype.startPolling_ = function() { 
  this.eventHandler_.listen(this.pollingTimer_, goog.Timer.TICK, this.pollResponse_); 
  this.pollingTimer_.start(); 
}; 
goog.net.ChannelRequest.prototype.stopPolling_ = function() { 
  this.pollingTimer_.stop(); 
  this.eventHandler_.removeAll(); 
}; 
goog.net.ChannelRequest.prototype.getNextChunk_ = function(responseText) { 
  var sizeStartIndex = this.xmlHttpChunkStart_; 
  var sizeEndIndex = responseText.indexOf('\n', sizeStartIndex); 
  if(sizeEndIndex == - 1) { 
    return goog.net.ChannelRequest.INCOMPLETE_CHUNK_; 
  } 
  var sizeAsString = responseText.substring(sizeStartIndex, sizeEndIndex); 
  var size = Number(sizeAsString); 
  if(isNaN(size)) { 
    return goog.net.ChannelRequest.INVALID_CHUNK_; 
  } 
  var chunkStartIndex = sizeEndIndex + 1; 
  if(chunkStartIndex + size > responseText.length) { 
    return goog.net.ChannelRequest.INCOMPLETE_CHUNK_; 
  } 
  var chunkText = responseText.substr(chunkStartIndex, size); 
  this.xmlHttpChunkStart_ = chunkStartIndex + size; 
  return chunkText; 
}; 
goog.net.ChannelRequest.prototype.tridentGet = function(uri, usingSecondaryDomain) { 
  this.type_ = goog.net.ChannelRequest.Type_.TRIDENT; 
  this.baseUri_ = uri.clone().makeUnique(); 
  this.tridentGet_(usingSecondaryDomain); 
}; 
goog.net.ChannelRequest.prototype.tridentGet_ = function(usingSecondaryDomain) { 
  this.trident_ = new ActiveXObject('htmlfile'); 
  var hostname = ''; 
  var body = '<html><body>'; 
  if(usingSecondaryDomain) { 
    hostname = window.location.hostname; 
    body += '<script>document.domain="' + hostname + '"</scr' + 'ipt>'; 
  } 
  body += '</body></html>'; 
  this.trident_.open(); 
  this.trident_.write(body); 
  this.trident_.close(); 
  this.trident_.parentWindow['m']= goog.bind(this.onTridentRpcMessage_, this); 
  this.trident_.parentWindow['d']= goog.bind(this.onTridentDone_, this, true); 
  this.trident_.parentWindow['rpcClose']= goog.bind(this.onTridentDone_, this, false); 
  var div = this.trident_.createElement('div'); 
  this.trident_.parentWindow.document.body.appendChild(div); 
  this.requestUri_ = this.baseUri_.clone(); 
  this.requestUri_.setParameterValue('DOMAIN', hostname); 
  this.requestUri_.setParameterValue('t', this.retryId_); 
  div.innerHTML = '<iframe src="' + this.requestUri_ + '"></iframe>'; 
  this.requestStartTime_ = goog.now(); 
  this.channelDebug_.tridentChannelRequest('GET', this.requestUri_, this.rid_, this.retryId_); 
  this.ensureWatchDogTimer_(); 
}; 
goog.net.ChannelRequest.prototype.onTridentRpcMessage_ = function(msg) { 
  goog.net.BrowserChannel.setTimeout(goog.bind(this.onTridentRpcMessageAsync_, this, msg), 0); 
}; 
goog.net.ChannelRequest.prototype.onTridentRpcMessageAsync_ = function(msg) { 
  if(this.cancelled_) { 
    return; 
  } 
  this.channelDebug_.tridentChannelResponseText(this.rid_, msg); 
  this.cancelWatchDogTimer_(); 
  this.safeOnRequestData_(msg); 
  this.ensureWatchDogTimer_(); 
}; 
goog.net.ChannelRequest.prototype.onTridentDone_ = function(successful) { 
  goog.net.BrowserChannel.setTimeout(goog.bind(this.onTridentDoneAsync_, this, successful), 0); 
}; 
goog.net.ChannelRequest.prototype.onTridentDoneAsync_ = function(successful) { 
  if(this.cancelled_) { 
    return; 
  } 
  this.channelDebug_.tridentChannelResponseDone(this.rid_, successful); 
  this.cancelWatchDogTimer_(); 
  this.cleanup_(); 
  this.successful_ = successful; 
  this.channel_.onRequestComplete(this); 
}; 
goog.net.ChannelRequest.prototype.sendUsingImgTag = function(uri) { 
  this.type_ = goog.net.ChannelRequest.Type_.IMG; 
  this.baseUri_ = uri.clone().makeUnique(); 
  this.imgTagGet_(); 
}; 
goog.net.ChannelRequest.prototype.imgTagGet_ = function() { 
  var eltImg = new Image(); 
  eltImg.src = this.baseUri_; 
  this.requestStartTime_ = goog.now(); 
  this.ensureWatchDogTimer_(); 
}; 
goog.net.ChannelRequest.prototype.cancel = function() { 
  this.cancelled_ = true; 
  this.cancelWatchDogTimer_(); 
  this.cleanup_(); 
}; 
goog.net.ChannelRequest.prototype.ensureWatchDogTimer_ = function() { 
  this.watchDogTimeoutTime_ = goog.now() + this.timeout_; 
  this.startWatchDogTimer_(this.timeout_); 
}; 
goog.net.ChannelRequest.prototype.startWatchDogTimer_ = function(time) { 
  if(this.watchDogTimerId_ != null) { 
    throw Error('WatchDog timer not null'); 
  } 
  this.watchDogTimerId_ = goog.net.BrowserChannel.setTimeout(goog.bind(this.onWatchDogTimeout_, this), time); 
}; 
goog.net.ChannelRequest.prototype.cancelWatchDogTimer_ = function() { 
  if(this.watchDogTimerId_) { 
    goog.global.clearTimeout(this.watchDogTimerId_); 
    this.watchDogTimerId_ = null; 
  } 
}; 
goog.net.ChannelRequest.prototype.onWatchDogTimeout_ = function() { 
  this.watchDogTimerId_ = null; 
  var now = goog.now(); 
  if(now - this.watchDogTimeoutTime_ >= 0) { 
    this.handleTimeout_(); 
  } else { 
    this.channelDebug_.warning('WatchDog timer called too early'); 
    this.startWatchDogTimer_(this.watchDogTimeoutTime_ - now); 
  } 
}; 
goog.net.ChannelRequest.prototype.handleTimeout_ = function() { 
  if(this.successful_) { 
    this.channelDebug_.severe('Received watchdog timeout even though request loaded successfully'); 
  } 
  this.channelDebug_.timeoutResponse(this.requestUri_); 
  this.cleanup_(); 
  this.lastError_ = goog.net.ChannelRequest.Error.TIMEOUT; 
  goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.REQUEST_TIMEOUT); 
  this.dispatchFailure_(); 
}; 
goog.net.ChannelRequest.prototype.dispatchFailure_ = function() { 
  if(this.channel_.isClosed() || this.cancelled_) { 
    return; 
  } 
  this.channel_.onRequestComplete(this); 
}; 
goog.net.ChannelRequest.prototype.cleanup_ = function() { 
  this.stopPolling_(); 
  if(this.xmlHttp_) { 
    var xmlhttp = this.xmlHttp_; 
    this.xmlHttp_ = null; 
    goog.events.unlisten(xmlhttp, goog.net.EventType.READY_STATE_CHANGE, this.xmlHttpHandler_, false, this); 
    xmlhttp.abort(); 
  } 
  if(this.trident_) { 
    this.trident_ = null; 
  } 
}; 
goog.net.ChannelRequest.prototype.getSuccess = function() { 
  return this.successful_; 
}; 
goog.net.ChannelRequest.prototype.getLastError = function() { 
  return this.lastError_; 
}; 
goog.net.ChannelRequest.prototype.getLastStatusCode = function() { 
  return this.lastStatusCode_; 
}; 
goog.net.ChannelRequest.prototype.getSessionId = function() { 
  return this.sid_; 
}; 
goog.net.ChannelRequest.prototype.getRequestId = function() { 
  return this.rid_; 
}; 
goog.net.ChannelRequest.prototype.getPostData = function() { 
  return this.postData_; 
}; 
goog.net.ChannelRequest.prototype.getRequestStartTime = function() { 
  return this.requestStartTime_; 
}; 
goog.net.ChannelRequest.prototype.safeOnRequestData_ = function(data) { 
  try { 
    this.channel_.onRequestData(this, data); 
  } catch(e) { 
    this.channelDebug_.dumpException(e, 'Error in httprequest callback'); 
  } 
}; 

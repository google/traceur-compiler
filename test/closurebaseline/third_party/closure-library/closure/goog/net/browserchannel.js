
goog.provide('goog.net.BrowserChannel'); 
goog.provide('goog.net.BrowserChannel.Error'); 
goog.provide('goog.net.BrowserChannel.Event'); 
goog.provide('goog.net.BrowserChannel.Handler'); 
goog.provide('goog.net.BrowserChannel.LogSaver'); 
goog.provide('goog.net.BrowserChannel.QueuedMap'); 
goog.provide('goog.net.BrowserChannel.Stat'); 
goog.provide('goog.net.BrowserChannel.StatEvent'); 
goog.provide('goog.net.BrowserChannel.State'); 
goog.provide('goog.net.BrowserChannel.TimingEvent'); 
goog.require('goog.Uri'); 
goog.require('goog.array'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.debug.TextFormatter'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.json'); 
goog.require('goog.net.BrowserTestChannel'); 
goog.require('goog.net.ChannelDebug'); 
goog.require('goog.net.ChannelRequest'); 
goog.require('goog.net.ChannelRequest.Error'); 
goog.require('goog.net.XhrIo'); 
goog.require('goog.net.tmpnetwork'); 
goog.require('goog.string'); 
goog.require('goog.structs'); 
goog.require('goog.structs.CircularBuffer'); 
goog.require('goog.userAgent'); 
goog.net.BrowserChannel = function(clientVersion) { 
  this.clientVersion_ = clientVersion; 
  this.state_ = goog.net.BrowserChannel.State.INIT; 
  this.outgoingMaps_ =[]; 
  this.pendingMaps_ =[]; 
  this.channelDebug_ = new goog.net.ChannelDebug(); 
}; 
goog.net.BrowserChannel.QueuedMap = function(mapId, map) { 
  this.mapId = mapId; 
  this.map = map; 
}; 
goog.net.BrowserChannel.prototype.extraHeaders_ = null; 
goog.net.BrowserChannel.prototype.extraParams_ = null; 
goog.net.BrowserChannel.prototype.forwardChannelRequest_ = null; 
goog.net.BrowserChannel.prototype.backChannelRequest_ = null; 
goog.net.BrowserChannel.prototype.path_ = null; 
goog.net.BrowserChannel.prototype.forwardChannelUri_ = null; 
goog.net.BrowserChannel.prototype.backChannelUri_ = null; 
goog.net.BrowserChannel.prototype.hostPrefix_ = null; 
goog.net.BrowserChannel.prototype.allowHostPrefix_ = true; 
goog.net.BrowserChannel.prototype.nextRid_ = 0; 
goog.net.BrowserChannel.prototype.nextMapId_ = 0; 
goog.net.BrowserChannel.prototype.failFast_ = false; 
goog.net.BrowserChannel.prototype.handler_ = null; 
goog.net.BrowserChannel.prototype.forwardChannelTimerId_ = null; 
goog.net.BrowserChannel.prototype.backChannelTimerId_ = null; 
goog.net.BrowserChannel.prototype.deadBackChannelTimerId_ = null; 
goog.net.BrowserChannel.prototype.connectionTest_ = null; 
goog.net.BrowserChannel.prototype.useChunked_ = null; 
goog.net.BrowserChannel.prototype.allowChunkedMode_ = true; 
goog.net.BrowserChannel.prototype.lastArrayId_ = - 1; 
goog.net.BrowserChannel.prototype.lastPostResponseArrayId_ = - 1; 
goog.net.BrowserChannel.prototype.lastStatusCode_ = - 1; 
goog.net.BrowserChannel.prototype.forwardChannelRetryCount_ = 0; 
goog.net.BrowserChannel.prototype.backChannelRetryCount_ = 0; 
goog.net.BrowserChannel.prototype.backChannelAttemptId_; 
goog.net.BrowserChannel.LATEST_CHANNEL_VERSION = 8; 
goog.net.BrowserChannel.prototype.channelVersion_ = goog.net.BrowserChannel.LATEST_CHANNEL_VERSION; 
goog.net.BrowserChannel.State = { 
  CLOSED: 0, 
  INIT: 1, 
  OPENING: 2, 
  OPENED: 3 
}; 
goog.net.BrowserChannel.FORWARD_CHANNEL_MAX_RETRIES = 2; 
goog.net.BrowserChannel.FORWARD_CHANNEL_RETRY_TIMEOUT = 20 * 1000; 
goog.net.BrowserChannel.BACK_CHANNEL_MAX_RETRIES = 3; 
goog.net.BrowserChannel.RETRY_DELAY_MS = 5 * 1000; 
goog.net.BrowserChannel.RETRY_DELAY_SEED = 10 * 1000; 
goog.net.BrowserChannel.RTT_ESTIMATE = 3 * 1000; 
goog.net.BrowserChannel.INACTIVE_CHANNEL_RETRY_FACTOR = 2; 
goog.net.BrowserChannel.Error = { 
  OK: 0, 
  REQUEST_FAILED: 2, 
  LOGGED_OUT: 4, 
  NO_DATA: 5, 
  UNKNOWN_SESSION_ID: 6, 
  STOP: 7, 
  NETWORK: 8, 
  BLOCKED: 9, 
  BAD_DATA: 10, 
  BAD_RESPONSE: 11 
}; 
goog.net.BrowserChannel.ChannelType_ = { 
  FORWARD_CHANNEL: 1, 
  BACK_CHANNEL: 2 
}; 
goog.net.BrowserChannel.MAX_MAPS_PER_REQUEST_ = 1000; 
goog.net.BrowserChannel.statEventTarget_ = new goog.events.EventTarget(); 
goog.net.BrowserChannel.Event = { }; 
goog.net.BrowserChannel.Event.STAT_EVENT = 'statevent'; 
goog.net.BrowserChannel.StatEvent = function(eventTarget, stat) { 
  goog.events.Event.call(this, goog.net.BrowserChannel.Event.STAT_EVENT, eventTarget); 
  this.stat = stat; 
}; 
goog.inherits(goog.net.BrowserChannel.StatEvent, goog.events.Event); 
goog.net.BrowserChannel.Event.TIMING_EVENT = 'timingevent'; 
goog.net.BrowserChannel.TimingEvent = function(target, size, rtt, retries) { 
  goog.events.Event.call(this, goog.net.BrowserChannel.Event.TIMING_EVENT, target); 
  this.size = size; 
  this.rtt = rtt; 
  this.retries = retries; 
}; 
goog.inherits(goog.net.BrowserChannel.TimingEvent, goog.events.Event); 
goog.net.BrowserChannel.Stat = { 
  CONNECT_ATTEMPT: 0, 
  ERROR_NETWORK: 1, 
  ERROR_OTHER: 2, 
  TEST_STAGE_ONE_START: 3, 
  CHANNEL_BLOCKED: 4, 
  TEST_STAGE_TWO_START: 5, 
  TEST_STAGE_TWO_DATA_ONE: 6, 
  TEST_STAGE_TWO_DATA_TWO: 7, 
  TEST_STAGE_TWO_DATA_BOTH: 8, 
  TEST_STAGE_ONE_FAILED: 9, 
  TEST_STAGE_TWO_FAILED: 10, 
  PROXY: 11, 
  NOPROXY: 12, 
  REQUEST_UNKNOWN_SESSION_ID: 13, 
  REQUEST_BAD_STATUS: 14, 
  REQUEST_INCOMPLETE_DATA: 15, 
  REQUEST_BAD_DATA: 16, 
  REQUEST_NO_DATA: 17, 
  REQUEST_TIMEOUT: 18, 
  BACKCHANNEL_MISSING: 19, 
  BACKCHANNEL_DEAD: 20 
}; 
goog.net.BrowserChannel.MAGIC_RESPONSE_COOKIE = 'y2f%'; 
goog.net.BrowserChannel.OUTSTANDING_DATA_BACKCHANNEL_RETRY_CUTOFF = 37500; 
goog.net.BrowserChannel.prototype.getChannelDebug = function() { 
  return this.channelDebug_; 
}; 
goog.net.BrowserChannel.prototype.setChannelDebug = function(channelDebug) { 
  this.channelDebug_ = channelDebug; 
}; 
goog.net.BrowserChannel.setStartThreadExecutionHook = function(startHook) { 
  goog.net.BrowserChannel.startExecutionHook_ = startHook; 
}; 
goog.net.BrowserChannel.setEndThreadExecutionHook = function(endHook) { 
  goog.net.BrowserChannel.endExecutionHook_ = endHook; 
}; 
goog.net.BrowserChannel.startExecutionHook_ = function() { }; 
goog.net.BrowserChannel.endExecutionHook_ = function() { }; 
goog.net.BrowserChannel.createChannelRequest = function(channel, channelDebug, opt_sessionId, opt_requestId, opt_retryId) { 
  return new goog.net.ChannelRequest(channel, channelDebug, opt_sessionId, opt_requestId, opt_retryId); 
}; 
goog.net.BrowserChannel.prototype.connect = function(testPath, channelPath, extraParams, opt_oldSessionId, opt_oldArrayId) { 
  this.channelDebug_.debug('connect()'); 
  goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.CONNECT_ATTEMPT); 
  this.path_ = channelPath; 
  this.extraParams_ = extraParams || { }; 
  if(opt_oldSessionId && goog.isDef(opt_oldArrayId)) { 
    this.extraParams_['OSID']= opt_oldSessionId; 
    this.extraParams_['OAID']= opt_oldArrayId; 
  } 
  this.connectTest_(testPath); 
}; 
goog.net.BrowserChannel.prototype.disconnect = function() { 
  this.channelDebug_.debug('disconnect()'); 
  this.cancelRequests_(); 
  if(this.state_ == goog.net.BrowserChannel.State.OPENED) { 
    var rid = this.nextRid_ ++; 
    var uri = this.forwardChannelUri_.clone(); 
    uri.setParameterValue('SID', this.sid_); 
    uri.setParameterValue('RID', rid); 
    uri.setParameterValue('TYPE', 'terminate'); 
    this.addAdditionalParams_(uri); 
    var request = goog.net.BrowserChannel.createChannelRequest(this, this.channelDebug_, this.sid_, rid); 
    request.sendUsingImgTag(uri); 
    this.onClose_(); 
  } 
}; 
goog.net.BrowserChannel.prototype.getSessionId = function() { 
  return this.sid_; 
}; 
goog.net.BrowserChannel.prototype.connectTest_ = function(testPath) { 
  this.channelDebug_.debug('connectTest_()'); 
  this.connectionTest_ = new goog.net.BrowserTestChannel(this, this.channelDebug_); 
  this.connectionTest_.setExtraHeaders(this.extraHeaders_); 
  this.connectionTest_.connect(testPath); 
}; 
goog.net.BrowserChannel.prototype.connectChannel_ = function() { 
  this.channelDebug_.debug('connectChannel_()'); 
  this.ensureInState_(goog.net.BrowserChannel.State.INIT, goog.net.BrowserChannel.State.CLOSED); 
  this.forwardChannelUri_ = this.getForwardChannelUri((this.path_)); 
  this.ensureForwardChannel_(); 
}; 
goog.net.BrowserChannel.prototype.cancelRequests_ = function() { 
  if(this.connectionTest_) { 
    this.connectionTest_.abort(); 
    this.connectionTest_ = null; 
  } 
  if(this.backChannelRequest_) { 
    this.backChannelRequest_.cancel(); 
    this.backChannelRequest_ = null; 
  } 
  if(this.backChannelTimerId_) { 
    goog.global.clearTimeout(this.backChannelTimerId_); 
    this.backChannelTimerId_ = null; 
  } 
  this.clearDeadBackchannelTimer_(); 
  if(this.forwardChannelRequest_) { 
    this.forwardChannelRequest_.cancel(); 
    this.forwardChannelRequest_ = null; 
  } 
  if(this.forwardChannelTimerId_) { 
    goog.global.clearTimeout(this.forwardChannelTimerId_); 
    this.forwardChannelTimerId_ = null; 
  } 
}; 
goog.net.BrowserChannel.prototype.getExtraHeaders = function() { 
  return this.extraHeaders_; 
}; 
goog.net.BrowserChannel.prototype.setExtraHeaders = function(extraHeaders) { 
  this.extraHeaders_ = extraHeaders; 
}; 
goog.net.BrowserChannel.prototype.getHandler = function() { 
  return this.handler_; 
}; 
goog.net.BrowserChannel.prototype.setHandler = function(handler) { 
  this.handler_ = handler; 
}; 
goog.net.BrowserChannel.prototype.getAllowHostPrefix = function() { 
  return this.allowHostPrefix_; 
}; 
goog.net.BrowserChannel.prototype.setAllowHostPrefix = function(allowHostPrefix) { 
  this.allowHostPrefix_ = allowHostPrefix; 
}; 
goog.net.BrowserChannel.prototype.isBuffered = function() { 
  return ! this.useChunked_; 
}; 
goog.net.BrowserChannel.prototype.getAllowChunkedMode = function() { 
  return this.allowChunkedMode_; 
}; 
goog.net.BrowserChannel.prototype.setAllowChunkedMode = function(allowChunkedMode) { 
  this.allowChunkedMode_ = allowChunkedMode; 
}; 
goog.net.BrowserChannel.prototype.sendMap = function(map) { 
  if(this.state_ == goog.net.BrowserChannel.State.CLOSED) { 
    throw Error('Invalid operation: sending map when state is closed'); 
  } 
  if(this.outgoingMaps_.length == goog.net.BrowserChannel.MAX_MAPS_PER_REQUEST_) { 
    this.channelDebug_.severe('Already have ' + goog.net.BrowserChannel.MAX_MAPS_PER_REQUEST_ + ' queued maps upon queueing ' + goog.json.serialize(map)); 
  } 
  this.outgoingMaps_.push(new goog.net.BrowserChannel.QueuedMap(this.nextMapId_ ++, map)); 
  if(this.state_ == goog.net.BrowserChannel.State.OPENING || this.state_ == goog.net.BrowserChannel.State.OPENED) { 
    this.ensureForwardChannel_(); 
  } 
}; 
goog.net.BrowserChannel.prototype.setFailFast = function(failFast) { 
  this.failFast_ = failFast; 
  this.channelDebug_.info('setFailFast: ' + failFast); 
  if((this.forwardChannelRequest_ || this.forwardChannelTimerId_) && this.forwardChannelRetryCount_ > this.getForwardChannelMaxRetries()) { 
    this.channelDebug_.info('Retry count ' + this.forwardChannelRetryCount_ + ' > new maxRetries ' + this.getForwardChannelMaxRetries() + '. Fail immediately!'); 
    if(this.forwardChannelRequest_) { 
      this.forwardChannelRequest_.cancel(); 
      this.onRequestComplete(this.forwardChannelRequest_); 
    } else { 
      goog.global.clearTimeout(this.forwardChannelTimerId_); 
      this.forwardChannelTimerId_ = null; 
      this.signalError_(goog.net.BrowserChannel.Error.REQUEST_FAILED); 
    } 
  } 
}; 
goog.net.BrowserChannel.prototype.getForwardChannelMaxRetries = function() { 
  return this.failFast_ ? 0: goog.net.BrowserChannel.FORWARD_CHANNEL_MAX_RETRIES; 
}; 
goog.net.BrowserChannel.prototype.getBackChannelMaxRetries = function() { 
  return goog.net.BrowserChannel.BACK_CHANNEL_MAX_RETRIES; 
}; 
goog.net.BrowserChannel.prototype.isClosed = function() { 
  return this.state_ == goog.net.BrowserChannel.State.CLOSED; 
}; 
goog.net.BrowserChannel.prototype.getState = function() { 
  return this.state_; 
}; 
goog.net.BrowserChannel.prototype.getLastStatusCode = function() { 
  return this.lastStatusCode_; 
}; 
goog.net.BrowserChannel.prototype.getLastArrayId = function() { 
  return this.lastArrayId_; 
}; 
goog.net.BrowserChannel.prototype.hasOutstandingRequests = function() { 
  return this.outstandingRequests_() != 0; 
}; 
goog.net.BrowserChannel.prototype.outstandingRequests_ = function() { 
  var count = 0; 
  if(this.backChannelRequest_) { 
    count ++; 
  } 
  if(this.forwardChannelRequest_) { 
    count ++; 
  } 
  return count; 
}; 
goog.net.BrowserChannel.prototype.ensureForwardChannel_ = function() { 
  if(this.forwardChannelRequest_) { 
    return; 
  } 
  if(this.forwardChannelTimerId_) { 
    return; 
  } 
  this.forwardChannelTimerId_ = goog.net.BrowserChannel.setTimeout(goog.bind(this.onStartForwardChannelTimer_, this), 0); 
  this.forwardChannelRetryCount_ = 0; 
}; 
goog.net.BrowserChannel.prototype.maybeRetryForwardChannel_ = function(request) { 
  if(this.forwardChannelRequest_ || this.forwardChannelTimerId_) { 
    this.channelDebug_.severe('Request already in progress'); 
    return false; 
  } 
  if(this.state_ == goog.net.BrowserChannel.State.INIT ||(this.forwardChannelRetryCount_ >= this.getForwardChannelMaxRetries())) { 
    return false; 
  } 
  this.channelDebug_.debug('Going to retry POST'); 
  this.forwardChannelTimerId_ = goog.net.BrowserChannel.setTimeout(goog.bind(this.onStartForwardChannelTimer_, this, request), this.getRetryTime_(this.forwardChannelRetryCount_)); 
  this.forwardChannelRetryCount_ ++; 
  return true; 
}; 
goog.net.BrowserChannel.prototype.onStartForwardChannelTimer_ = function(opt_retryRequest) { 
  this.forwardChannelTimerId_ = null; 
  this.startForwardChannel_(opt_retryRequest); 
}; 
goog.net.BrowserChannel.prototype.startForwardChannel_ = function(opt_retryRequest) { 
  this.channelDebug_.debug('startForwardChannel_'); 
  if(this.state_ == goog.net.BrowserChannel.State.INIT) { 
    if(opt_retryRequest) { 
      this.channelDebug_.severe('Not supposed to retry the open'); 
      return; 
    } 
    this.open_(); 
    this.state_ = goog.net.BrowserChannel.State.OPENING; 
  } else if(this.state_ == goog.net.BrowserChannel.State.OPENED) { 
    if(! this.okToMakeRequest_()) { 
      return; 
    } 
    if(opt_retryRequest) { 
      this.makeForwardChannelRequest_(opt_retryRequest); 
      return; 
    } 
    if(this.outgoingMaps_.length == 0) { 
      this.channelDebug_.debug('startForwardChannel_ returned: ' + 'nothing to send'); 
      return; 
    } 
    if(this.forwardChannelRequest_) { 
      this.channelDebug_.severe('startForwardChannel_ returned: ' + 'connection already in progress'); 
      return; 
    } 
    this.makeForwardChannelRequest_(); 
    this.channelDebug_.debug('startForwardChannel_ finished, sent request'); 
  } 
}; 
goog.net.BrowserChannel.prototype.open_ = function() { 
  this.channelDebug_.debug('open_()'); 
  this.nextRid_ = Math.floor(Math.random() * 100000); 
  var rid = this.nextRid_ ++; 
  var request = goog.net.BrowserChannel.createChannelRequest(this, this.channelDebug_, '', rid); 
  request.setExtraHeaders(this.extraHeaders_); 
  var requestText = this.dequeueOutgoingMaps_(); 
  var uri = this.forwardChannelUri_.clone(); 
  uri.setParameterValue('RID', rid); 
  if(this.clientVersion_) { 
    uri.setParameterValue('CVER', this.clientVersion_); 
  } 
  this.addAdditionalParams_(uri); 
  request.xmlHttpPost(uri, requestText, true); 
  this.forwardChannelRequest_ = request; 
}; 
goog.net.BrowserChannel.prototype.makeForwardChannelRequest_ = function(opt_retryRequest) { 
  var rid; 
  var requestText; 
  if(opt_retryRequest) { 
    if(this.channelVersion_ > 6) { 
      this.requeuePendingMaps_(); 
      rid = this.nextRid_ - 1; 
      requestText = this.dequeueOutgoingMaps_(); 
    } else { 
      rid = opt_retryRequest.getRequestId(); 
      requestText =(opt_retryRequest.getPostData()); 
    } 
  } else { 
    rid = this.nextRid_ ++; 
    requestText = this.dequeueOutgoingMaps_(); 
  } 
  var uri = this.forwardChannelUri_.clone(); 
  uri.setParameterValue('SID', this.sid_); 
  uri.setParameterValue('RID', rid); 
  uri.setParameterValue('AID', this.lastArrayId_); 
  this.addAdditionalParams_(uri); 
  var request = goog.net.BrowserChannel.createChannelRequest(this, this.channelDebug_, this.sid_, rid, this.forwardChannelRetryCount_ + 1); 
  request.setExtraHeaders(this.extraHeaders_); 
  request.setTimeout(Math.round(goog.net.BrowserChannel.FORWARD_CHANNEL_RETRY_TIMEOUT * 0.50) + Math.round(goog.net.BrowserChannel.FORWARD_CHANNEL_RETRY_TIMEOUT * 0.50 * Math.random())); 
  this.forwardChannelRequest_ = request; 
  request.xmlHttpPost(uri, requestText, true); 
}; 
goog.net.BrowserChannel.prototype.addAdditionalParams_ = function(uri) { 
  if(this.handler_) { 
    var params = this.handler_.getAdditionalParams(this); 
    if(params) { 
      goog.structs.forEach(params, function(value, key, coll) { 
        uri.setParameterValue(key, value); 
      }); 
    } 
  } 
}; 
goog.net.BrowserChannel.prototype.dequeueOutgoingMaps_ = function() { 
  var count = Math.min(this.outgoingMaps_.length, goog.net.BrowserChannel.MAX_MAPS_PER_REQUEST_); 
  var sb =['count=' + count]; 
  var offset; 
  if(this.channelVersion_ > 6 && count > 0) { 
    offset = this.outgoingMaps_[0].mapId; 
    sb.push('ofs=' + offset); 
  } else { 
    offset = 0; 
  } 
  for(var i = 0; i < count; i ++) { 
    var mapId = this.outgoingMaps_[i].mapId; 
    var map = this.outgoingMaps_[i].map; 
    if(this.channelVersion_ <= 6) { 
      mapId = i; 
    } else { 
      mapId -= offset; 
    } 
    try { 
      goog.structs.forEach(map, function(value, key, coll) { 
        sb.push('req' + mapId + '_' + key + '=' + encodeURIComponent(value)); 
      }); 
    } catch(ex) { 
      sb.push('req' + mapId + '_' + 'type' + '=' + encodeURIComponent('_badmap')); 
      if(this.handler_) { 
        this.handler_.badMapError(this, map); 
      } 
    } 
  } 
  this.pendingMaps_ = this.pendingMaps_.concat(this.outgoingMaps_.splice(0, count)); 
  return sb.join('&'); 
}; 
goog.net.BrowserChannel.prototype.requeuePendingMaps_ = function() { 
  this.outgoingMaps_ = this.pendingMaps_.concat(this.outgoingMaps_); 
  this.pendingMaps_.length = 0; 
}; 
goog.net.BrowserChannel.prototype.ensureBackChannel_ = function() { 
  if(this.backChannelRequest_) { 
    return; 
  } 
  if(this.backChannelTimerId_) { 
    return; 
  } 
  this.backChannelAttemptId_ = 1; 
  this.backChannelTimerId_ = goog.net.BrowserChannel.setTimeout(goog.bind(this.onStartBackChannelTimer_, this), 0); 
  this.backChannelRetryCount_ = 0; 
}; 
goog.net.BrowserChannel.prototype.maybeRetryBackChannel_ = function() { 
  if(this.backChannelRequest_ || this.backChannelTimerId_) { 
    this.channelDebug_.severe('Request already in progress'); 
    return false; 
  } 
  if(this.backChannelRetryCount_ >= this.getBackChannelMaxRetries()) { 
    return false; 
  } 
  this.channelDebug_.debug('Going to retry GET'); 
  this.backChannelAttemptId_ ++; 
  this.backChannelTimerId_ = goog.net.BrowserChannel.setTimeout(goog.bind(this.onStartBackChannelTimer_, this), this.getRetryTime_(this.backChannelRetryCount_)); 
  this.backChannelRetryCount_ ++; 
  return true; 
}; 
goog.net.BrowserChannel.prototype.onStartBackChannelTimer_ = function() { 
  this.backChannelTimerId_ = null; 
  this.startBackChannel_(); 
}; 
goog.net.BrowserChannel.prototype.startBackChannel_ = function() { 
  if(! this.okToMakeRequest_()) { 
    return; 
  } 
  this.channelDebug_.debug('Creating new HttpRequest'); 
  this.backChannelRequest_ = goog.net.BrowserChannel.createChannelRequest(this, this.channelDebug_, this.sid_, 'rpc', this.backChannelAttemptId_); 
  this.backChannelRequest_.setExtraHeaders(this.extraHeaders_); 
  var uri = this.backChannelUri_.clone(); 
  uri.setParameterValue('RID', 'rpc'); 
  uri.setParameterValue('SID', this.sid_); 
  uri.setParameterValue('CI', this.useChunked_ ? '0': '1'); 
  uri.setParameterValue('AID', this.lastArrayId_); 
  this.addAdditionalParams_(uri); 
  if(goog.userAgent.IE) { 
    uri.setParameterValue('TYPE', 'html'); 
    this.backChannelRequest_.tridentGet(uri, Boolean(this.hostPrefix_)); 
  } else { 
    uri.setParameterValue('TYPE', 'xmlhttp'); 
    this.backChannelRequest_.xmlHttpGet(uri, true, this.hostPrefix_, false); 
  } 
  this.channelDebug_.debug('New Request created'); 
}; 
goog.net.BrowserChannel.prototype.okToMakeRequest_ = function() { 
  if(this.handler_) { 
    var result = this.handler_.okToMakeRequest(this); 
    if(result != goog.net.BrowserChannel.Error.OK) { 
      this.channelDebug_.debug('Handler returned error code from ' + 'okToMakeRequest'); 
      this.signalError_(result); 
      return false; 
    } 
  } 
  return true; 
}; 
goog.net.BrowserChannel.prototype.testConnectionFinished = function(testChannel, useChunked) { 
  this.channelDebug_.debug('Test Connection Finished'); 
  this.useChunked_ = this.allowChunkedMode_ && useChunked; 
  this.lastStatusCode_ = testChannel.getLastStatusCode(); 
  this.connectChannel_(); 
}; 
goog.net.BrowserChannel.prototype.testConnectionFailure = function(testChannel, errorCode) { 
  this.channelDebug_.debug('Test Connection Failed'); 
  this.lastStatusCode_ = testChannel.getLastStatusCode(); 
  this.signalError_(goog.net.BrowserChannel.Error.REQUEST_FAILED); 
}; 
goog.net.BrowserChannel.prototype.testConnectionBlocked = function(testChannel) { 
  this.channelDebug_.debug('Test Connection Blocked'); 
  this.lastStatusCode_ = this.connectionTest_.getLastStatusCode(); 
  this.signalError_(goog.net.BrowserChannel.Error.BLOCKED); 
}; 
goog.net.BrowserChannel.prototype.onRequestData = function(request, responseText) { 
  if(this.state_ == goog.net.BrowserChannel.State.CLOSED ||(this.backChannelRequest_ != request && this.forwardChannelRequest_ != request)) { 
    return; 
  } 
  this.lastStatusCode_ = request.getLastStatusCode(); 
  if(this.forwardChannelRequest_ == request && this.state_ == goog.net.BrowserChannel.State.OPENED) { 
    if(this.channelVersion_ > 7) { 
      var response; 
      try { 
        response =(goog.json.unsafeParse(responseText)); 
      } catch(ex) { 
        response = null; 
      } 
      if(goog.isArray(response) && response.length == 3) { 
        this.handlePostResponse_(response); 
      } else { 
        this.channelDebug_.debug('Bad POST response data returned'); 
        this.signalError_(goog.net.BrowserChannel.Error.BAD_RESPONSE); 
      } 
    } else if(responseText != goog.net.BrowserChannel.MAGIC_RESPONSE_COOKIE) { 
      this.channelDebug_.debug('Bad data returned - missing/invald ' + 'magic cookie'); 
      this.signalError_(goog.net.BrowserChannel.Error.BAD_RESPONSE); 
    } 
  } else { 
    if(this.backChannelRequest_ == request) { 
      this.clearDeadBackchannelTimer_(); 
    } 
    if(! goog.string.isEmpty(responseText)) { 
      this.onInput_((goog.json.unsafeParse(responseText))); 
    } 
  } 
}; 
goog.net.BrowserChannel.prototype.handlePostResponse_ = function(responseValues) { 
  if(responseValues[0]== 0) { 
    this.handleBackchannelMissing_(); 
    return; 
  } 
  this.lastPostResponseArrayId_ = responseValues[1]; 
  var outstandingArrays = this.lastPostResponseArrayId_ - this.lastArrayId_; 
  if(0 < outstandingArrays) { 
    var numOutstandingBackchannelBytes = responseValues[2]; 
    this.channelDebug_.debug(numOutstandingBackchannelBytes + ' bytes (in ' + outstandingArrays + ' arrays) are outstanding on the BackChannel'); 
    if(! this.shouldRetryBackChannel_(numOutstandingBackchannelBytes)) { 
      return; 
    } 
    if(! this.deadBackChannelTimerId_) { 
      this.deadBackChannelTimerId_ = goog.net.BrowserChannel.setTimeout(goog.bind(this.onBackChannelDead_, this), 2 * goog.net.BrowserChannel.RTT_ESTIMATE); 
    } 
  } 
}; 
goog.net.BrowserChannel.prototype.handleBackchannelMissing_ = function() { 
  this.channelDebug_.debug('Server claims our backchannel is missing.'); 
  if(this.backChannelTimerId_) { 
    this.channelDebug_.debug('But we are currently starting the request.'); 
    return; 
  } else if(! this.backChannelRequest_) { 
    this.channelDebug_.warning('We do not have a BackChannel established'); 
  } else if(this.backChannelRequest_.getRequestStartTime() + goog.net.BrowserChannel.RTT_ESTIMATE < this.forwardChannelRequest_.getRequestStartTime()) { 
    this.clearDeadBackchannelTimer_(); 
    this.backChannelRequest_.cancel(); 
    this.backChannelRequest_ = null; 
  } else { 
    return; 
  } 
  this.maybeRetryBackChannel_(); 
  goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.BACKCHANNEL_MISSING); 
}; 
goog.net.BrowserChannel.prototype.shouldRetryBackChannel_ = function(outstandingBytes) { 
  return outstandingBytes < goog.net.BrowserChannel.OUTSTANDING_DATA_BACKCHANNEL_RETRY_CUTOFF && ! this.isBuffered() && this.backChannelRetryCount_ == 0; 
}; 
goog.net.BrowserChannel.prototype.correctHostPrefix = function(serverHostPrefix) { 
  if(this.allowHostPrefix_) { 
    if(this.handler_) { 
      return this.handler_.correctHostPrefix(serverHostPrefix); 
    } 
    return serverHostPrefix; 
  } 
  return null; 
}; 
goog.net.BrowserChannel.prototype.onBackChannelDead_ = function() { 
  if(goog.isDefAndNotNull(this.deadBackChannelTimerId_)) { 
    this.deadBackChannelTimerId_ = null; 
    this.backChannelRequest_.cancel(); 
    this.backChannelRequest_ = null; 
    this.maybeRetryBackChannel_(); 
    goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.BACKCHANNEL_DEAD); 
  } 
}; 
goog.net.BrowserChannel.prototype.clearDeadBackchannelTimer_ = function() { 
  if(goog.isDefAndNotNull(this.deadBackChannelTimerId_)) { 
    goog.global.clearTimeout(this.deadBackChannelTimerId_); 
    this.deadBackChannelTimerId_ = null; 
  } 
}; 
goog.net.BrowserChannel.isFatalError_ = function(error, statusCode) { 
  return error == goog.net.ChannelRequest.Error.UNKNOWN_SESSION_ID ||(error == goog.net.ChannelRequest.Error.STATUS && statusCode > 0); 
}; 
goog.net.BrowserChannel.prototype.onRequestComplete = function(request) { 
  this.channelDebug_.debug('Request complete'); 
  var type; 
  if(this.backChannelRequest_ == request) { 
    this.clearDeadBackchannelTimer_(); 
    this.backChannelRequest_ = null; 
    type = goog.net.BrowserChannel.ChannelType_.BACK_CHANNEL; 
  } else if(this.forwardChannelRequest_ == request) { 
    this.forwardChannelRequest_ = null; 
    type = goog.net.BrowserChannel.ChannelType_.FORWARD_CHANNEL; 
  } else { 
    return; 
  } 
  this.lastStatusCode_ = request.getLastStatusCode(); 
  if(this.state_ == goog.net.BrowserChannel.State.CLOSED) { 
    return; 
  } 
  if(request.getSuccess()) { 
    if(type == goog.net.BrowserChannel.ChannelType_.FORWARD_CHANNEL) { 
      var size = request.getPostData() ? request.getPostData().length: 0; 
      goog.net.BrowserChannel.notifyTimingEvent(size, goog.now() - request.getRequestStartTime(), this.forwardChannelRetryCount_); 
      this.ensureForwardChannel_(); 
      this.pendingMaps_.length = 0; 
    } else { 
      this.ensureBackChannel_(); 
    } 
    return; 
  } 
  var lastError = request.getLastError(); 
  if(! goog.net.BrowserChannel.isFatalError_(lastError, this.lastStatusCode_)) { 
    this.channelDebug_.debug('Maybe retrying, last error: ' + goog.net.ChannelRequest.errorStringFromCode((lastError), this.lastStatusCode_)); 
    if(type == goog.net.BrowserChannel.ChannelType_.FORWARD_CHANNEL) { 
      if(this.maybeRetryForwardChannel_(request)) { 
        return; 
      } 
    } 
    if(type == goog.net.BrowserChannel.ChannelType_.BACK_CHANNEL) { 
      if(this.maybeRetryBackChannel_()) { 
        return; 
      } 
    } 
    this.channelDebug_.debug('Exceeded max number of retries'); 
  } else { 
    this.channelDebug_.debug('Not retrying due to error type'); 
  } 
  this.channelDebug_.debug('Error: HTTP request failed'); 
  switch(lastError) { 
    case goog.net.ChannelRequest.Error.NO_DATA: 
      this.signalError_(goog.net.BrowserChannel.Error.NO_DATA); 
      break; 

    case goog.net.ChannelRequest.Error.BAD_DATA: 
      this.signalError_(goog.net.BrowserChannel.Error.BAD_DATA); 
      break; 

    case goog.net.ChannelRequest.Error.UNKNOWN_SESSION_ID: 
      this.signalError_(goog.net.BrowserChannel.Error.UNKNOWN_SESSION_ID); 
      break; 

    default: 
      this.signalError_(goog.net.BrowserChannel.Error.REQUEST_FAILED); 
      break; 

  } 
}; 
goog.net.BrowserChannel.prototype.getRetryTime_ = function(retryCount) { 
  var retryTime = goog.net.BrowserChannel.RETRY_DELAY_MS + Math.floor(Math.random() * goog.net.BrowserChannel.RETRY_DELAY_SEED); 
  if(! this.isActive()) { 
    this.channelDebug_.debug('Inactive channel'); 
    retryTime = retryTime * goog.net.BrowserChannel.INACTIVE_CHANNEL_RETRY_FACTOR; 
  } 
  retryTime = retryTime * retryCount; 
  return retryTime; 
}; 
goog.net.BrowserChannel.prototype.onInput_ = function(respArray) { 
  var batch = this.handler_ && this.handler_.channelHandleMultipleArrays ?[]: null; 
  for(var i = 0; i < respArray.length; i ++) { 
    var nextArray = respArray[i]; 
    this.lastArrayId_ = nextArray[0]; 
    nextArray = nextArray[1]; 
    if(this.state_ == goog.net.BrowserChannel.State.OPENING) { 
      if(nextArray[0]== 'c') { 
        this.sid_ = nextArray[1]; 
        this.hostPrefix_ = this.correctHostPrefix(nextArray[2]); 
        var negotiatedVersion = nextArray[3]; 
        if(goog.isDefAndNotNull(negotiatedVersion)) { 
          this.channelVersion_ = negotiatedVersion; 
        } else { 
          this.channelVersion_ = 6; 
        } 
        this.state_ = goog.net.BrowserChannel.State.OPENED; 
        if(this.handler_) { 
          this.handler_.channelOpened(this); 
        } 
        this.backChannelUri_ = this.getBackChannelUri(this.hostPrefix_,(this.path_)); 
        this.ensureBackChannel_(); 
      } else if(nextArray[0]== 'stop') { 
        this.signalError_(goog.net.BrowserChannel.Error.STOP); 
      } 
    } else if(this.state_ == goog.net.BrowserChannel.State.OPENED) { 
      if(nextArray[0]== 'stop') { 
        if(batch && batch.length) { 
          this.handler_.channelHandleMultipleArrays(this, batch); 
          batch.length = 0; 
        } 
        this.signalError_(goog.net.BrowserChannel.Error.STOP); 
      } else if(nextArray[0]== 'noop') { } else { 
        if(batch) { 
          batch.push(nextArray); 
        } else if(this.handler_) { 
          this.handler_.channelHandleArray(this, nextArray); 
        } 
      } 
      this.backChannelRetryCount_ = 0; 
    } 
  } 
  if(batch && batch.length) { 
    this.handler_.channelHandleMultipleArrays(this, batch); 
  } 
}; 
goog.net.BrowserChannel.prototype.ensureInState_ = function(var_args) { 
  if(! goog.array.contains(arguments, this.state_)) { 
    throw Error('Unexpected channel state: ' + this.state_); 
  } 
}; 
goog.net.BrowserChannel.prototype.signalError_ = function(error) { 
  this.channelDebug_.info('Error code ' + error); 
  if(error == goog.net.BrowserChannel.Error.REQUEST_FAILED || error == goog.net.BrowserChannel.Error.BLOCKED) { 
    var imageUri = null; 
    if(this.handler_) { 
      imageUri = this.handler_.getNetworkTestImageUri(this); 
    } 
    goog.net.tmpnetwork.testGoogleCom(goog.bind(this.testGoogleComCallback_, this), imageUri); 
  } else { 
    goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.ERROR_OTHER); 
  } 
  this.onError_(error); 
}; 
goog.net.BrowserChannel.prototype.testGoogleComCallback_ = function(networkUp) { 
  if(networkUp) { 
    this.channelDebug_.info('Successfully pinged google.com'); 
    goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.ERROR_OTHER); 
  } else { 
    this.channelDebug_.info('Failed to ping google.com'); 
    goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.ERROR_NETWORK); 
    this.onError_(goog.net.BrowserChannel.Error.NETWORK); 
  } 
}; 
goog.net.BrowserChannel.prototype.onError_ = function(error) { 
  this.channelDebug_.debug('HttpChannel: error - ' + error); 
  this.state_ = goog.net.BrowserChannel.State.CLOSED; 
  if(this.handler_) { 
    this.handler_.channelError(this, error); 
  } 
  this.onClose_(); 
  this.cancelRequests_(); 
}; 
goog.net.BrowserChannel.prototype.onClose_ = function() { 
  this.state_ = goog.net.BrowserChannel.State.CLOSED; 
  this.lastStatusCode_ = - 1; 
  if(this.handler_) { 
    if(this.pendingMaps_.length == 0 && this.outgoingMaps_.length == 0) { 
      this.handler_.channelClosed(this); 
    } else { 
      this.channelDebug_.debug('Number of undelivered maps' + ', pending: ' + this.pendingMaps_.length + ', outgoing: ' + this.outgoingMaps_.length); 
      var copyOfPendingMaps = goog.array.clone(this.pendingMaps_); 
      var copyOfUndeliveredMaps = goog.array.clone(this.outgoingMaps_); 
      this.pendingMaps_.length = 0; 
      this.outgoingMaps_.length = 0; 
      this.handler_.channelClosed(this, copyOfPendingMaps, copyOfUndeliveredMaps); 
    } 
  } 
}; 
goog.net.BrowserChannel.prototype.getForwardChannelUri = function(path) { 
  var uri = this.createDataUri(null, path); 
  this.channelDebug_.debug('GetForwardChannelUri: ' + uri); 
  return uri; 
}; 
goog.net.BrowserChannel.prototype.getBackChannelUri = function(hostPrefix, path) { 
  var uri = this.createDataUri(this.shouldUseSecondaryDomains() ? hostPrefix: null, path); 
  this.channelDebug_.debug('GetBackChannelUri: ' + uri); 
  return uri; 
}; 
goog.net.BrowserChannel.prototype.createDataUri = function(hostPrefix, path, opt_overridePort) { 
  var locationPage = window.location; 
  var hostName; 
  if(hostPrefix) { 
    hostName = hostPrefix + '.' + locationPage.hostname; 
  } else { 
    hostName = locationPage.hostname; 
  } 
  var port = opt_overridePort || locationPage.port; 
  var uri = goog.Uri.create(locationPage.protocol, null, hostName, port, path); 
  if(this.extraParams_) { 
    goog.structs.forEach(this.extraParams_, function(value, key, coll) { 
      uri.setParameterValue(key, value); 
    }); 
  } 
  uri.setParameterValue('VER', this.channelVersion_); 
  this.addAdditionalParams_(uri); 
  return uri; 
}; 
goog.net.BrowserChannel.prototype.createXhrIo = function(hostPrefix) { 
  if(hostPrefix) { 
    throw new Error('Can\'t create secondary domain capable XhrIo object.'); 
  } else { 
    return new goog.net.XhrIo(); 
  } 
}; 
goog.net.BrowserChannel.prototype.isActive = function() { 
  return ! ! this.handler_ && this.handler_.isActive(this); 
}; 
goog.net.BrowserChannel.setTimeout = function(fn, ms) { 
  if(! goog.isFunction(fn)) { 
    throw Error('Fn must not be null and must be a function'); 
  } 
  return goog.global.setTimeout(function() { 
    goog.net.BrowserChannel.onStartExecution(); 
    try { 
      fn(); 
    } finally { 
      goog.net.BrowserChannel.onEndExecution(); 
    } 
  }, ms); 
}; 
goog.net.BrowserChannel.onStartExecution = function() { 
  goog.net.BrowserChannel.startExecutionHook_(); 
}; 
goog.net.BrowserChannel.onEndExecution = function() { 
  goog.net.BrowserChannel.endExecutionHook_(); 
}; 
goog.net.BrowserChannel.getStatEventTarget = function() { 
  return goog.net.BrowserChannel.statEventTarget_; 
}; 
goog.net.BrowserChannel.notifyStatEvent = function(stat) { 
  var target = goog.net.BrowserChannel.statEventTarget_; 
  target.dispatchEvent(new goog.net.BrowserChannel.StatEvent(target, stat)); 
}; 
goog.net.BrowserChannel.notifyTimingEvent = function(size, rtt, retries) { 
  var target = goog.net.BrowserChannel.statEventTarget_; 
  target.dispatchEvent(new goog.net.BrowserChannel.TimingEvent(target, size, rtt, retries)); 
}; 
goog.net.BrowserChannel.prototype.shouldUseSecondaryDomains = function() { 
  return goog.userAgent.IE; 
}; 
goog.net.BrowserChannel.LogSaver = { }; 
goog.net.BrowserChannel.LogSaver.buffer_ = new goog.structs.CircularBuffer(1000); 
goog.net.BrowserChannel.LogSaver.enabled_ = false; 
goog.net.BrowserChannel.LogSaver.formatter_ = new goog.debug.TextFormatter(); 
goog.net.BrowserChannel.LogSaver.isEnabled = function() { 
  return goog.net.BrowserChannel.LogSaver.enabled_; 
}; 
goog.net.BrowserChannel.LogSaver.setEnabled = function(enable) { 
  if(enable == goog.net.BrowserChannel.LogSaver.enabled_) { 
    return; 
  } 
  var fn = goog.net.BrowserChannel.LogSaver.addLogRecord; 
  var logger = goog.debug.Logger.getLogger('goog.net'); 
  if(enable) { 
    logger.addHandler(fn); 
  } else { 
    logger.removeHandler(fn); 
  } 
}; 
goog.net.BrowserChannel.LogSaver.addLogRecord = function(logRecord) { 
  goog.net.BrowserChannel.LogSaver.buffer_.add(goog.net.BrowserChannel.LogSaver.formatter_.formatRecord(logRecord)); 
}; 
goog.net.BrowserChannel.LogSaver.getBuffer = function() { 
  return goog.net.BrowserChannel.LogSaver.buffer_.getValues().join(''); 
}; 
goog.net.BrowserChannel.LogSaver.clearBuffer = function() { 
  goog.net.BrowserChannel.LogSaver.buffer_.clear(); 
}; 
goog.net.BrowserChannel.Handler = function() { }; 
goog.net.BrowserChannel.Handler.prototype.channelHandleMultipleArrays = null; 
goog.net.BrowserChannel.Handler.prototype.okToMakeRequest = function(browserChannel) { 
  return goog.net.BrowserChannel.Error.OK; 
}; 
goog.net.BrowserChannel.Handler.prototype.channelOpened = function(browserChannel) { }; 
goog.net.BrowserChannel.Handler.prototype.channelHandleArray = function(browserChannel, array) { }; 
goog.net.BrowserChannel.Handler.prototype.channelError = function(browserChannel, error) { }; 
goog.net.BrowserChannel.Handler.prototype.channelClosed = function(browserChannel, opt_pendingMaps, opt_undeliveredMaps) { }; 
goog.net.BrowserChannel.Handler.prototype.getAdditionalParams = function(browserChannel) { 
  return { }; 
}; 
goog.net.BrowserChannel.Handler.prototype.getNetworkTestImageUri = function(browserChannel) { 
  return null; 
}; 
goog.net.BrowserChannel.Handler.prototype.isActive = function(browserChannel) { 
  return true; 
}; 
goog.net.BrowserChannel.Handler.prototype.badMapError = function(browserChannel, map) { 
  return; 
}; 
goog.net.BrowserChannel.Handler.prototype.correctHostPrefix = function(serverHostPrefix) { 
  return serverHostPrefix; 
}; 

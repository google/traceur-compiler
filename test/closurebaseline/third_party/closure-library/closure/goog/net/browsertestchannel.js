
goog.provide('goog.net.BrowserTestChannel'); 
goog.require('goog.json'); 
goog.require('goog.net.ChannelRequest.Error'); 
goog.require('goog.net.tmpnetwork'); 
goog.require('goog.userAgent'); 
goog.net.BrowserTestChannel = function(channel, channelDebug) { 
  this.channel_ = channel; 
  this.channelDebug_ = channelDebug; 
}; 
goog.net.BrowserTestChannel.prototype.extraHeaders_ = null; 
goog.net.BrowserTestChannel.prototype.request_ = null; 
goog.net.BrowserTestChannel.prototype.receivedIntermediateResult_ = false; 
goog.net.BrowserTestChannel.prototype.startTime_ = null; 
goog.net.BrowserTestChannel.prototype.firstTime_ = null; 
goog.net.BrowserTestChannel.prototype.lastTime_ = null; 
goog.net.BrowserTestChannel.prototype.path_ = null; 
goog.net.BrowserTestChannel.prototype.state_ = null; 
goog.net.BrowserTestChannel.prototype.lastStatusCode_ = - 1; 
goog.net.BrowserTestChannel.prototype.hostPrefix_ = null; 
goog.net.BrowserTestChannel.prototype.blockedPrefix_ = null; 
goog.net.BrowserTestChannel.State_ = { 
  INIT: 0, 
  CHECKING_BLOCKED: 1, 
  CONNECTION_TESTING: 2 
}; 
goog.net.BrowserTestChannel.BLOCKED_TIMEOUT_ = 5000; 
goog.net.BrowserTestChannel.BLOCKED_RETRIES_ = 3; 
goog.net.BrowserTestChannel.BLOCKED_PAUSE_BETWEEN_RETRIES_ = 2000; 
goog.net.BrowserTestChannel.MIN_TIME_EXPECTED_BETWEEN_DATA_ = 500; 
goog.net.BrowserTestChannel.prototype.setExtraHeaders = function(extraHeaders) { 
  this.extraHeaders_ = extraHeaders; 
}; 
goog.net.BrowserTestChannel.prototype.connect = function(path) { 
  this.path_ = path; 
  var sendDataUri = this.channel_.getForwardChannelUri(this.path_); 
  goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.TEST_STAGE_ONE_START); 
  sendDataUri.setParameterValues('MODE', 'init'); 
  this.request_ = goog.net.BrowserChannel.createChannelRequest(this, this.channelDebug_); 
  this.request_.setExtraHeaders(this.extraHeaders_); 
  this.request_.xmlHttpGet(sendDataUri, false, null, true); 
  this.state_ = goog.net.BrowserTestChannel.State_.INIT; 
  this.startTime_ = goog.now(); 
}; 
goog.net.BrowserTestChannel.prototype.checkBlocked_ = function() { 
  var uri = this.channel_.createDataUri(this.blockedPrefix_, '/mail/images/cleardot.gif'); 
  uri.makeUnique(); 
  goog.net.tmpnetwork.testLoadImageWithRetries(uri.toString(), goog.net.BrowserTestChannel.BLOCKED_TIMEOUT_, goog.bind(this.checkBlockedCallback_, this), goog.net.BrowserTestChannel.BLOCKED_RETRIES_, goog.net.BrowserTestChannel.BLOCKED_PAUSE_BETWEEN_RETRIES_); 
}; 
goog.net.BrowserTestChannel.prototype.checkBlockedCallback_ = function(succeeded) { 
  if(succeeded) { 
    this.state_ = goog.net.BrowserTestChannel.State_.CONNECTION_TESTING; 
    this.connectStage2_(); 
  } else { 
    goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.CHANNEL_BLOCKED); 
    this.channel_.testConnectionBlocked(this); 
  } 
}; 
goog.net.BrowserTestChannel.prototype.connectStage2_ = function() { 
  this.channelDebug_.debug('TestConnection: starting stage 2'); 
  this.request_ = goog.net.BrowserChannel.createChannelRequest(this, this.channelDebug_); 
  this.request_.setExtraHeaders(this.extraHeaders_); 
  var recvDataUri = this.channel_.getBackChannelUri(this.hostPrefix_,(this.path_)); 
  goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.TEST_STAGE_TWO_START); 
  if(goog.userAgent.IE) { 
    recvDataUri.setParameterValues('TYPE', 'html'); 
    this.request_.tridentGet(recvDataUri, Boolean(this.hostPrefix_)); 
  } else { 
    recvDataUri.setParameterValues('TYPE', 'xmlhttp'); 
    this.request_.xmlHttpGet(recvDataUri, false, this.hostPrefix_, false); 
  } 
}; 
goog.net.BrowserTestChannel.prototype.createXhrIo = function(hostPrefix) { 
  return this.channel_.createXhrIo(hostPrefix); 
}; 
goog.net.BrowserTestChannel.prototype.abort = function() { 
  if(this.request_) { 
    this.request_.cancel(); 
    this.request_ = null; 
  } 
  this.lastStatusCode_ = - 1; 
}; 
goog.net.BrowserTestChannel.prototype.isClosed = function() { 
  return false; 
}; 
goog.net.BrowserTestChannel.prototype.onRequestData = function(req, responseText) { 
  this.lastStatusCode_ = req.getLastStatusCode(); 
  if(this.state_ == goog.net.BrowserTestChannel.State_.INIT) { 
    this.channelDebug_.debug('TestConnection: Got data for stage 1'); 
    if(! responseText) { 
      this.channelDebug_.debug('TestConnection: Null responseText'); 
      this.channel_.testConnectionFailure(this, goog.net.ChannelRequest.Error.BAD_DATA); 
      return; 
    } 
    try { 
      var respArray = goog.json.unsafeParse(responseText); 
    } catch(e) { 
      this.channelDebug_.dumpException(e); 
      this.channel_.testConnectionFailure(this, goog.net.ChannelRequest.Error.BAD_DATA); 
      return; 
    } 
    this.hostPrefix_ = this.channel_.correctHostPrefix(respArray[0]); 
    this.blockedPrefix_ = respArray[1]; 
  } else if(this.state_ == goog.net.BrowserTestChannel.State_.CONNECTION_TESTING) { 
    if(this.receivedIntermediateResult_) { 
      goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.TEST_STAGE_TWO_DATA_TWO); 
      this.lastTime_ = goog.now(); 
    } else { 
      if(responseText == '11111') { 
        goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.TEST_STAGE_TWO_DATA_ONE); 
        this.receivedIntermediateResult_ = true; 
        this.firstTime_ = goog.now(); 
        if(this.checkForEarlyNonBuffered_()) { 
          this.lastStatusCode_ = 200; 
          this.request_.cancel(); 
          this.channelDebug_.debug('Test connection succeeded; using streaming connection'); 
          goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.NOPROXY); 
          this.channel_.testConnectionFinished(this, true); 
        } 
      } else { 
        goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.TEST_STAGE_TWO_DATA_BOTH); 
        this.firstTime_ = this.lastTime_ = goog.now(); 
        this.receivedIntermediateResult_ = false; 
      } 
    } 
  } 
}; 
goog.net.BrowserTestChannel.prototype.onRequestComplete = function(req) { 
  this.lastStatusCode_ = this.request_.getLastStatusCode(); 
  if(! this.request_.getSuccess()) { 
    this.channelDebug_.debug('TestConnection: request failed, in state ' + this.state_); 
    if(this.state_ == goog.net.BrowserTestChannel.State_.INIT) { 
      goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.TEST_STAGE_ONE_FAILED); 
    } else if(this.state_ == goog.net.BrowserTestChannel.State_.CONNECTION_TESTING) { 
      goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.TEST_STAGE_TWO_FAILED); 
    } 
    this.channel_.testConnectionFailure(this,(this.request_.getLastError())); 
    return; 
  } 
  if(this.state_ == goog.net.BrowserTestChannel.State_.INIT) { 
    this.channelDebug_.debug('TestConnection: request complete for initial check'); 
    if(this.blockedPrefix_) { 
      this.state_ = goog.net.BrowserTestChannel.State_.CHECKING_BLOCKED; 
      this.checkBlocked_(); 
    } else { 
      this.state_ = goog.net.BrowserTestChannel.State_.CONNECTION_TESTING; 
      this.connectStage2_(); 
    } 
  } else if(this.state_ == goog.net.BrowserTestChannel.State_.CONNECTION_TESTING) { 
    this.channelDebug_.debug('TestConnection: request complete for stage 2'); 
    var goodConn = false; 
    if(goog.userAgent.IE) { 
      var ms = this.lastTime_ - this.firstTime_; 
      if(ms < 200) { 
        goodConn = false; 
      } else { 
        goodConn = true; 
      } 
    } else { 
      goodConn = this.receivedIntermediateResult_; 
    } 
    if(goodConn) { 
      this.channelDebug_.debug('Test connection succeeded; using streaming connection'); 
      goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.NOPROXY); 
      this.channel_.testConnectionFinished(this, true); 
    } else { 
      this.channelDebug_.debug('Test connection failed; not using streaming'); 
      goog.net.BrowserChannel.notifyStatEvent(goog.net.BrowserChannel.Stat.PROXY); 
      this.channel_.testConnectionFinished(this, false); 
    } 
  } 
}; 
goog.net.BrowserTestChannel.prototype.getLastStatusCode = function() { 
  return this.lastStatusCode_; 
}; 
goog.net.BrowserTestChannel.prototype.shouldUseSecondaryDomains = function() { 
  return this.channel_.shouldUseSecondaryDomains(); 
}; 
goog.net.BrowserTestChannel.prototype.isActive = function(browserChannel) { 
  return this.channel_.isActive(); 
}; 
goog.net.BrowserTestChannel.prototype.checkForEarlyNonBuffered_ = function() { 
  var ms = this.firstTime_ - this.startTime_; 
  return ! goog.userAgent.IE || ms < goog.net.BrowserTestChannel.MIN_TIME_EXPECTED_BETWEEN_DATA_; 
}; 

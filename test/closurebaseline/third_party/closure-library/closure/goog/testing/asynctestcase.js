
goog.provide('goog.testing.AsyncTestCase'); 
goog.provide('goog.testing.AsyncTestCase.ControlBreakingException'); 
goog.require('goog.testing.TestCase'); 
goog.require('goog.testing.TestCase.Test'); 
goog.require('goog.testing.asserts'); 
goog.testing.AsyncTestCase = function(opt_name) { 
  goog.testing.TestCase.call(this, opt_name); 
}; 
goog.inherits(goog.testing.AsyncTestCase, goog.testing.TestCase); 
goog.testing.AsyncTestCase.ControlBreakingException = function() { }; 
goog.testing.AsyncTestCase.ControlBreakingException.TO_STRING = '[AsyncTestCase.ControlBreakingException]'; 
goog.testing.AsyncTestCase.ControlBreakingException.prototype.isControlBreakingException = true; 
goog.testing.AsyncTestCase.ControlBreakingException.prototype.toString = function() { 
  return goog.testing.AsyncTestCase.ControlBreakingException.TO_STRING; 
}; 
goog.testing.AsyncTestCase.prototype.stepTimeout = 1000; 
goog.testing.AsyncTestCase.prototype.timeToSleepAfterFailure = 500; 
goog.testing.AsyncTestCase.prototype.enableDebugLogs_ = false; 
goog.testing.AsyncTestCase.prototype.origAssert_; 
goog.testing.AsyncTestCase.prototype.origFail_; 
goog.testing.AsyncTestCase.prototype.origOnError_; 
goog.testing.AsyncTestCase.prototype.curStepFunc_; 
goog.testing.AsyncTestCase.prototype.curStepName_ = ''; 
goog.testing.AsyncTestCase.prototype.nextStepFunc; 
goog.testing.AsyncTestCase.prototype.nextStepName_ = ''; 
goog.testing.AsyncTestCase.prototype.timeoutHandle_; 
goog.testing.AsyncTestCase.prototype.cleanedUp_ = false; 
goog.testing.AsyncTestCase.prototype.activeTest; 
goog.testing.AsyncTestCase.prototype.inException_ = false; 
goog.testing.AsyncTestCase.prototype.isReady_ = true; 
goog.testing.AsyncTestCase.prototype.returnWillPump_ = false; 
goog.testing.AsyncTestCase.prototype.numControlExceptionsExpected_ = 0; 
goog.testing.AsyncTestCase.createAndInstall = function(opt_name) { 
  var asyncTestCase = new goog.testing.AsyncTestCase(opt_name); 
  goog.testing.TestCase.initializeTestRunner(asyncTestCase); 
  return asyncTestCase; 
}; 
goog.testing.AsyncTestCase.prototype.waitForAsync = function(opt_name) { 
  this.isReady_ = false; 
  this.curStepName_ = opt_name || this.curStepName_; 
  this.stopTimeoutTimer_(); 
  this.startTimeoutTimer_(); 
}; 
goog.testing.AsyncTestCase.prototype.continueTesting = function() { 
  if(! this.isReady_) { 
    this.isReady_ = true; 
    this.stopTimeoutTimer_(); 
    this.timeout(goog.bind(this.pump_, this, null), 0); 
  } 
}; 
goog.testing.AsyncTestCase.prototype.doAsyncError = function(opt_e) { 
  if(opt_e && opt_e.isControlBreakingException) { 
    throw opt_e; 
  } 
  this.stopTimeoutTimer_(); 
  var fakeTestObj = new goog.testing.TestCase.Test(this.curStepName_, goog.nullFunction); 
  if(this.activeTest) { 
    fakeTestObj.name = this.activeTest.name + ' [' + fakeTestObj.name + ']'; 
  } 
  this.doError(fakeTestObj, opt_e); 
  this.timeout(goog.bind(this.pump_, this, this.doAsyncErrorTearDown_), this.timeToSleepAfterFailure); 
  if(! this.returnWillPump_) { 
    this.numControlExceptionsExpected_ += 1; 
    this.dbgLog_('doAsynError: numControlExceptionsExpected_ = ' + this.numControlExceptionsExpected_ + ' and throwing exception.'); 
  } 
  throw new goog.testing.AsyncTestCase.ControlBreakingException(); 
}; 
goog.testing.AsyncTestCase.prototype.runTests = function() { 
  this.hookAssert_(); 
  this.hookOnError_(); 
  this.setNextStep_(this.doSetUpPage_, 'setUpPage'); 
  this.pump_(); 
}; 
goog.testing.AsyncTestCase.prototype.cycleTests = function() { 
  this.saveMessage('Start'); 
  this.setNextStep_(this.doIteration_, 'doIteration'); 
  this.pump_(); 
}; 
goog.testing.AsyncTestCase.prototype.finalize = function() { 
  this.unhookAll_(); 
  this.setNextStep_(null, 'finalized'); 
  goog.testing.AsyncTestCase.superClass_.finalize.call(this); 
}; 
goog.testing.AsyncTestCase.prototype.enableDebugLogging = function() { 
  this.enableDebugLogs_ = true; 
}; 
goog.testing.AsyncTestCase.prototype.dbgLog_ = function(message) { 
  if(this.enableDebugLogs_) { 
    this.log('AsyncTestCase - ' + message); 
  } 
}; 
goog.testing.AsyncTestCase.prototype.doTopOfStackAsyncError_ = function(opt_e) { 
  try { 
    this.doAsyncError(opt_e); 
  } catch(e) { 
    if(e.isControlBreakingException) { 
      this.numControlExceptionsExpected_ -= 1; 
      this.dbgLog_('doTopOfStackAsyncError_: numControlExceptionsExpected_ = ' + this.numControlExceptionsExpected_ + ' and catching exception.'); 
    } else { 
      throw e; 
    } 
  } 
}; 
goog.testing.AsyncTestCase.prototype.doAsyncErrorTearDown_ = function() { 
  if(this.inException_) { 
    this.continueTesting(); 
  } else { 
    this.inException_ = true; 
    this.isReady_ = true; 
    var stepFuncAfterError = this.nextStepFunc_; 
    var stepNameAfterError = 'TestCase.execute (after error)'; 
    if(this.activeTest) { 
      stepFuncAfterError = this.doIteration_; 
      stepNameAfterError = 'doIteration (after error)'; 
    } 
    this.setNextStep_(function() { 
      this.inException_ = false; 
      this.setNextStep_(stepFuncAfterError, stepNameAfterError); 
    }, 'doAsyncError'); 
    if(! this.cleanedUp_) { 
      this.cleanedUp_ = true; 
      this.tearDown(); 
    } 
  } 
}; 
goog.testing.AsyncTestCase.prototype.hookAssert_ = function() { 
  if(! this.origAssert_) { 
    this.origAssert_ = _assert; 
    this.origFail_ = fail; 
    var self = this; 
    _assert = function() { 
      try { 
        self.origAssert_.apply(this, arguments); 
      } catch(e) { 
        self.dbgLog_('Wrapping failed assert()'); 
        self.doAsyncError(e); 
      } 
    }; 
    fail = function() { 
      try { 
        self.origFail_.apply(this, arguments); 
      } catch(e) { 
        self.dbgLog_('Wrapping fail()'); 
        self.doAsyncError(e); 
      } 
    }; 
  } 
}; 
goog.testing.AsyncTestCase.prototype.hookOnError_ = function() { 
  if(! this.origOnError_) { 
    this.origOnError_ = window.onerror; 
    var self = this; 
    window.onerror = function(error, url, line) { 
      var cbe = goog.testing.AsyncTestCase.ControlBreakingException.TO_STRING; 
      if(error.indexOf(cbe) != - 1 && self.numControlExceptionsExpected_) { 
        self.numControlExceptionsExpected_ -= 1; 
        self.dbgLog_('window.onerror: numControlExceptionsExpected_ = ' + self.numControlExceptionsExpected_ + ' and ignoring exception. ' + error); 
        return true; 
      } else { 
        self.dbgLog_('window.onerror caught exception.'); 
        var message = error + '\nURL: ' + url + '\nLine: ' + line; 
        self.doTopOfStackAsyncError_(message); 
        return false; 
      } 
    }; 
  } 
}; 
goog.testing.AsyncTestCase.prototype.unhookAll_ = function() { 
  if(this.origOnError_) { 
    window.onerror = this.origOnError_; 
    this.origOnError_ = null; 
    _assert = this.origAssert_; 
    this.origAssert_ = null; 
    fail = this.origFail_; 
    this.origFail_ = null; 
  } 
}; 
goog.testing.AsyncTestCase.prototype.startTimeoutTimer_ = function() { 
  if(! this.timeoutHandle_ && this.stepTimeout > 0) { 
    this.timeoutHandle_ = this.timeout(goog.bind(function() { 
      this.dbgLog_('Timeout timer fired with id ' + this.timeoutHandle_); 
      this.timeoutHandle_ = null; 
      this.doTopOfStackAsyncError_('Timed out while waiting for ' + 'continueTesting() to be called.'); 
    }, this, null), this.stepTimeout); 
    this.dbgLog_('Started timeout timer with id ' + this.timeoutHandle_); 
  } 
}; 
goog.testing.AsyncTestCase.prototype.stopTimeoutTimer_ = function() { 
  if(this.timeoutHandle_) { 
    this.dbgLog_('Clearing timeout timer with id ' + this.timeoutHandle_); 
    window.clearTimeout(this.timeoutHandle_); 
    this.timeoutHandle_ = 0; 
  } 
}; 
goog.testing.AsyncTestCase.prototype.setNextStep_ = function(func, name) { 
  this.nextStepFunc_ = func && goog.bind(func, this); 
  this.nextStepName_ = name; 
}; 
goog.testing.AsyncTestCase.prototype.callTopOfStackFunc_ = function(func) { 
  try { 
    func.call(this); 
    return false; 
  } catch(e) { 
    this.dbgLog_('Caught exception in callTopOfStackFunc_'); 
    try { 
      this.doAsyncError(e); 
      return false; 
    } catch(e2) { 
      if(! e2.isControlBreakingException) { 
        throw e2; 
      } 
      return true; 
    } 
  } 
}; 
goog.testing.AsyncTestCase.prototype.pump_ = function(opt_doFirst) { 
  if(! this.returnWillPump_) { 
    this.setBatchTime(this.now_()); 
    this.returnWillPump_ = true; 
    var shouldThrowAndNotReturn = false; 
    if(opt_doFirst) { 
      shouldThrowAndNotReturn = this.callTopOfStackFunc_(opt_doFirst); 
    } 
    while(this.isReady_ && this.nextStepFunc_ && ! shouldThrowAndNotReturn) { 
      this.curStepFunc_ = this.nextStepFunc_; 
      this.curStepName_ = this.nextStepName_; 
      this.nextStepFunc_ = null; 
      this.nextStepName_ = ''; 
      this.dbgLog_('Performing step: ' + this.curStepName_); 
      shouldThrowAndNotReturn = this.callTopOfStackFunc_((this.curStepFunc_)); 
      var delta = this.now_() - this.getBatchTime(); 
      if(delta > goog.testing.TestCase.MAX_RUN_TIME && ! shouldThrowAndNotReturn) { 
        this.saveMessage('Breaking async'); 
        var self = this; 
        this.timeout(function() { 
          self.pump_(); 
        }, 100); 
        break; 
      } 
    } 
    this.returnWillPump_ = false; 
    if(shouldThrowAndNotReturn) { 
      this.numControlExceptionsExpected_ += 1; 
      this.dbgLog_('pump: numControlExceptionsExpected_ = ' + this.numControlExceptionsExpected_ + ' and throwing exception.'); 
      throw new goog.testing.AsyncTestCase.ControlBreakingException(); 
    } 
  } else if(opt_doFirst) { 
    opt_doFirst.call(this); 
  } 
}; 
goog.testing.AsyncTestCase.prototype.doSetUpPage_ = function() { 
  this.setNextStep_(this.execute, 'TestCase.execute'); 
  this.setUpPage(); 
}; 
goog.testing.AsyncTestCase.prototype.doIteration_ = function() { 
  this.activeTest = this.next(); 
  if(this.activeTest && this.running) { 
    this.result_.runCount ++; 
    this.setNextStep_(this.doSetUp_, 'setUp'); 
  } else { 
    this.finalize(); 
  } 
}; 
goog.testing.AsyncTestCase.prototype.doSetUp_ = function() { 
  this.log('Running test: ' + this.activeTest.name); 
  this.cleanedUp_ = false; 
  this.setNextStep_(this.doExecute_, this.activeTest.name); 
  this.setUp(); 
}; 
goog.testing.AsyncTestCase.prototype.doExecute_ = function() { 
  this.setNextStep_(this.doTearDown_, 'tearDown'); 
  this.activeTest.execute(); 
}; 
goog.testing.AsyncTestCase.prototype.doTearDown_ = function() { 
  this.cleanedUp_ = true; 
  this.setNextStep_(this.doNext_, 'doNext'); 
  this.tearDown(); 
}; 
goog.testing.AsyncTestCase.prototype.doNext_ = function() { 
  this.setNextStep_(this.doIteration_, 'doIteration'); 
  this.doSuccess((this.activeTest)); 
}; 


goog.provide('goog.testing.ExpectedFailures'); 
goog.require('goog.debug.DivConsole'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.dom'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.events'); 
goog.require('goog.events.EventType'); 
goog.require('goog.style'); 
goog.require('goog.testing.JsUnitException'); 
goog.require('goog.testing.TestCase'); 
goog.require('goog.testing.asserts'); 
goog.testing.ExpectedFailures = function() { 
  goog.testing.ExpectedFailures.setUpConsole_(); 
  this.reset_(); 
}; 
goog.testing.ExpectedFailures.console_ = null; 
goog.testing.ExpectedFailures.prototype.logger_ = goog.debug.Logger.getLogger('goog.testing.ExpectedFailures'); 
goog.testing.ExpectedFailures.prototype.expectingFailure_; 
goog.testing.ExpectedFailures.prototype.failureMessage_; 
goog.testing.ExpectedFailures.prototype.suppressedFailures_; 
goog.testing.ExpectedFailures.setUpConsole_ = function() { 
  if(! goog.testing.ExpectedFailures.console_) { 
    var xButton = goog.dom.createDom(goog.dom.TagName.DIV, { 'style': 'position: absolute; border-left:1px solid #333;' + 'border-bottom:1px solid #333; right: 0; top: 0; width: 1em;' + 'height: 1em; cursor: pointer; background-color: #cde;' + 'text-align: center; color: black' }, 'X'); 
    var div = goog.dom.createDom(goog.dom.TagName.DIV, { 'style': 'position: absolute; border: 1px solid #333; right: 10px;' + 'top : 10px; width: 400px; display: none' }, xButton); 
    document.body.appendChild(div); 
    goog.events.listen(xButton, goog.events.EventType.CLICK, function() { 
      goog.style.showElement(div, false); 
    }); 
    goog.testing.ExpectedFailures.console_ = new goog.debug.DivConsole(div); 
    goog.testing.ExpectedFailures.prototype.logger_.addHandler(goog.bind(goog.style.showElement, null, div, true)); 
    goog.testing.ExpectedFailures.prototype.logger_.addHandler(goog.bind(goog.testing.ExpectedFailures.console_.addLogRecord, goog.testing.ExpectedFailures.console_)); 
  } 
}; 
goog.testing.ExpectedFailures.prototype.expectFailureFor = function(condition, opt_message) { 
  this.expectingFailure_ = this.expectingFailure_ || condition; 
  if(condition) { 
    this.failureMessage_ = this.failureMessage_ || opt_message || ''; 
  } 
}; 
goog.testing.ExpectedFailures.prototype.isExceptionExpected = function(ex) { 
  return this.expectingFailure_ && ex instanceof goog.testing.JsUnitException; 
}; 
goog.testing.ExpectedFailures.prototype.handleException = function(ex) { 
  if(this.isExceptionExpected(ex)) { 
    this.logger_.info('Suppressing test failure in ' + goog.testing.TestCase.currentTestName + ':' +(this.failureMessage_ ? '\n(' + this.failureMessage_ + ')': ''), ex); 
    this.suppressedFailures_.push(ex); 
    return; 
  } 
  throw ex; 
}; 
goog.testing.ExpectedFailures.prototype.run = function(func, opt_lenient) { 
  try { 
    func(); 
  } catch(ex) { 
    this.handleException(ex); 
  } 
  if(! opt_lenient && this.expectingFailure_ && ! this.suppressedFailures_.length) { 
    fail(this.getExpectationMessage_()); 
  } 
}; 
goog.testing.ExpectedFailures.prototype.getExpectationMessage_ = function() { 
  return 'Expected a test failure in \'' + goog.testing.TestCase.currentTestName + '\' but the test passed.'; 
}; 
goog.testing.ExpectedFailures.prototype.handleTearDown = function() { 
  if(this.expectingFailure_ && ! this.suppressedFailures_.length) { 
    this.logger_.warning(this.getExpectationMessage_()); 
  } 
  this.reset_(); 
}; 
goog.testing.ExpectedFailures.prototype.reset_ = function() { 
  this.expectingFailure_ = false; 
  this.failureMessage_ = ''; 
  this.suppressedFailures_ =[]; 
}; 

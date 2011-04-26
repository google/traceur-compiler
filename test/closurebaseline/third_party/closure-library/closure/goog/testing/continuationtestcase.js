
goog.provide('goog.testing.ContinuationTestCase'); 
goog.provide('goog.testing.ContinuationTestCase.Step'); 
goog.provide('goog.testing.ContinuationTestCase.Test'); 
goog.require('goog.array'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.testing.TestCase'); 
goog.require('goog.testing.TestCase.Test'); 
goog.require('goog.testing.asserts'); 
goog.testing.ContinuationTestCase = function(opt_name) { 
  goog.testing.TestCase.call(this, opt_name); 
  this.handler_ = new goog.events.EventHandler(this); 
}; 
goog.inherits(goog.testing.ContinuationTestCase, goog.testing.TestCase); 
goog.testing.ContinuationTestCase.MAX_TIMEOUT = 1000; 
goog.testing.ContinuationTestCase.locked_ = false; 
goog.testing.ContinuationTestCase.prototype.currentTest_ = null; 
goog.testing.ContinuationTestCase.prototype.enableWaitFunctions_ = function(enable) { 
  if(enable) { 
    goog.exportSymbol('waitForCondition', goog.bind(this.waitForCondition, this)); 
    goog.exportSymbol('waitForEvent', goog.bind(this.waitForEvent, this)); 
    goog.exportSymbol('waitForTimeout', goog.bind(this.waitForTimeout, this)); 
  } else { 
    goog.global['waitForCondition']= undefined; 
    goog.global['waitForEvent']= undefined; 
    goog.global['waitForTimeout']= undefined; 
  } 
}; 
goog.testing.ContinuationTestCase.prototype.runTests = function() { 
  this.enableWaitFunctions_(true); 
  goog.testing.ContinuationTestCase.superClass_.runTests.call(this); 
}; 
goog.testing.ContinuationTestCase.prototype.finalize = function() { 
  this.enableWaitFunctions_(false); 
  goog.testing.ContinuationTestCase.superClass_.finalize.call(this); 
}; 
goog.testing.ContinuationTestCase.prototype.cycleTests = function() { 
  if(! this.currentTest_) { 
    this.currentTest_ = this.createNextTest_(); 
  } 
  if(this.currentTest_) { 
    this.runNextStep_(); 
  } else { 
    this.finalize(); 
  } 
}; 
goog.testing.ContinuationTestCase.prototype.createNextTest_ = function() { 
  var test = this.next(); 
  if(! test) { 
    return null; 
  } 
  var name = test.name; 
  goog.testing.TestCase.currentTestName = name; 
  this.result_.runCount ++; 
  this.log('Running test: ' + name); 
  return new goog.testing.ContinuationTestCase.Test(new goog.testing.TestCase.Test(name, this.setUp, this), test, new goog.testing.TestCase.Test(name, this.tearDown, this)); 
}; 
goog.testing.ContinuationTestCase.prototype.finishTest_ = function() { 
  var err = this.currentTest_.getError(); 
  if(err) { 
    this.doError(this.currentTest_, err); 
  } else { 
    this.doSuccess(this.currentTest_); 
  } 
  goog.testing.TestCase.currentTestName = null; 
  this.currentTest_ = null; 
  this.locked_ = false; 
  this.handler_.removeAll(); 
  this.timeout(goog.bind(this.cycleTests, this), 0); 
}; 
goog.testing.ContinuationTestCase.prototype.runNextStep_ = function() { 
  if(this.locked_) { 
    return; 
  } 
  var phase = this.currentTest_.getCurrentPhase(); 
  if(! phase || ! phase.length) { 
    this.finishTest_(); 
    return; 
  } 
  var stepIndex = goog.array.findIndex(phase, function(step) { 
    return ! step.waiting; 
  }); 
  if(stepIndex < 0) { 
    return; 
  } 
  this.locked_ = true; 
  var step = phase[stepIndex]; 
  try { 
    step.execute(); 
    goog.array.removeAt(phase, stepIndex); 
  } catch(e) { 
    this.currentTest_.setError(e); 
    this.currentTest_.cancelCurrentPhase(); 
    this.currentTest_.cancelTestPhase(); 
  } 
  this.locked_ = false; 
  this.runNextStep_(); 
}; 
goog.testing.ContinuationTestCase.prototype.waitForTimeout = function(continuation, opt_duration) { 
  var step = this.addStep_(continuation); 
  step.setTimeout(goog.bind(this.handleComplete_, this, step), opt_duration || 0); 
}; 
goog.testing.ContinuationTestCase.prototype.waitForEvent = function(eventTarget, eventType, continuation) { 
  var step = this.addStep_(continuation); 
  var duration = goog.testing.ContinuationTestCase.MAX_TIMEOUT; 
  step.setTimeout(goog.bind(this.handleTimeout_, this, step, duration), duration); 
  this.handler_.listenOnce(eventTarget, eventType, goog.bind(this.handleComplete_, this, step)); 
}; 
goog.testing.ContinuationTestCase.prototype.waitForCondition = function(condition, continuation, opt_interval, opt_maxTimeout) { 
  var interval = opt_interval || 100; 
  var timeout = opt_maxTimeout || goog.testing.ContinuationTestCase.MAX_TIMEOUT; 
  var step = this.addStep_(continuation); 
  this.testCondition_(step, condition, goog.now(), interval, timeout); 
}; 
goog.testing.ContinuationTestCase.prototype.addStep_ = function(func) { 
  if(! this.currentTest_) { 
    throw Error('Cannot add test steps outside of a running test.'); 
  } 
  var step = new goog.testing.ContinuationTestCase.Step(this.currentTest_.name, func, this.currentTest_.scope); 
  this.currentTest_.addStep(step); 
  return step; 
}; 
goog.testing.ContinuationTestCase.prototype.handleComplete_ = function(step) { 
  step.clearTimeout(); 
  step.waiting = false; 
  this.runNextStep_(); 
}; 
goog.testing.ContinuationTestCase.prototype.handleTimeout_ = function(step, duration) { 
  step.ref = function() { 
    fail('Continuation timed out after ' + duration + 'ms.'); 
  }; 
  this.handler_.removeAll(); 
  this.handleComplete_(step); 
}; 
goog.testing.ContinuationTestCase.prototype.testCondition_ = function(step, condition, startTime, interval, timeout) { 
  var duration = goog.now() - startTime; 
  if(condition()) { 
    this.handleComplete_(step); 
  } else if(duration < timeout) { 
    step.setTimeout(goog.bind(this.testCondition_, this, step, condition, startTime, interval, timeout), interval); 
  } else { 
    this.handleTimeout_(step, duration); 
  } 
}; 
goog.testing.ContinuationTestCase.Test = function(setUp, test, tearDown) { 
  goog.testing.TestCase.Test.call(this, test.name, null, null); 
  this.setUp_ =[setUp]; 
  this.test_ =[test]; 
  this.tearDown_ =[tearDown]; 
}; 
goog.inherits(goog.testing.ContinuationTestCase.Test, goog.testing.TestCase.Test); 
goog.testing.ContinuationTestCase.Test.prototype.error_ = null; 
goog.testing.ContinuationTestCase.Test.prototype.getError = function() { 
  return this.error_; 
}; 
goog.testing.ContinuationTestCase.Test.prototype.setError = function(e) { 
  this.error_ = this.error_ || e; 
}; 
goog.testing.ContinuationTestCase.Test.prototype.getCurrentPhase = function() { 
  if(this.setUp_.length) { 
    return this.setUp_; 
  } 
  if(this.test_.length) { 
    return this.test_; 
  } 
  if(this.tearDown_.length) { 
    return this.tearDown_; 
  } 
  return null; 
}; 
goog.testing.ContinuationTestCase.Test.prototype.addStep = function(step) { 
  var phase = this.getCurrentPhase(); 
  if(phase) { 
    phase.push(step); 
  } else { 
    throw Error('Attempted to add a step to a completed test.'); 
  } 
}; 
goog.testing.ContinuationTestCase.Test.prototype.cancelCurrentPhase = function() { 
  this.cancelPhase_(this.getCurrentPhase()); 
}; 
goog.testing.ContinuationTestCase.Test.prototype.cancelTestPhase = function() { 
  this.cancelPhase_(this.setUp_); 
  this.cancelPhase_(this.test_); 
}; 
goog.testing.ContinuationTestCase.Test.prototype.cancelPhase_ = function(phase) { 
  while(phase && phase.length) { 
    var step = phase.pop(); 
    if(step instanceof goog.testing.ContinuationTestCase.Step) { 
      step.clearTimeout(); 
    } 
  } 
}; 
goog.testing.ContinuationTestCase.Step = function(name, ref, opt_scope) { 
  goog.testing.TestCase.Test.call(this, name, ref, opt_scope); 
}; 
goog.inherits(goog.testing.ContinuationTestCase.Step, goog.testing.TestCase.Test); 
goog.testing.ContinuationTestCase.Step.prototype.waiting = true; 
goog.testing.ContinuationTestCase.Step.protectedClearTimeout_ = window.clearTimeout; 
goog.testing.ContinuationTestCase.Step.protectedSetTimeout_ = window.setTimeout; 
goog.testing.ContinuationTestCase.Step.prototype.timeout_; 
goog.testing.ContinuationTestCase.Step.prototype.setTimeout = function(func, duration) { 
  this.clearTimeout(); 
  var setTimeout = goog.testing.ContinuationTestCase.Step.protectedSetTimeout_; 
  this.timeout_ = setTimeout(func, duration); 
}; 
goog.testing.ContinuationTestCase.Step.prototype.clearTimeout = function() { 
  if(this.timeout_) { 
    var clear = goog.testing.ContinuationTestCase.Step.protectedClearTimeout_; 
    clear(this.timeout_); 
    delete this.timeout_; 
  } 
}; 

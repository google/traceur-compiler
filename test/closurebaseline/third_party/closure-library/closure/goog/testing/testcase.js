
goog.provide('goog.testing.TestCase'); 
goog.provide('goog.testing.TestCase.Error'); 
goog.provide('goog.testing.TestCase.Order'); 
goog.provide('goog.testing.TestCase.Result'); 
goog.provide('goog.testing.TestCase.Test'); 
goog.require('goog.testing.asserts'); 
goog.require('goog.testing.stacktrace'); 
goog.testing.TestCase = function(opt_name) { 
  this.name_ = opt_name || 'Untitled Test Case'; 
  this.tests_ =[]; 
  this.testsToRun_ = null; 
  var search = window.location.search; 
  var runTestsMatch = search.match(/(?:\?|&)runTests=([^?&]+)/i); 
  if(runTestsMatch) { 
    this.testsToRun_ = { }; 
    var arr = runTestsMatch[1].split(','); 
    for(var i = 0, len = arr.length; i < len; i ++) { 
      this.testsToRun_[arr[i]]= 1; 
    } 
  } 
  var orderMatch = search.match(/(?:\?|&)order=(natural|random|sorted)/i); 
  if(orderMatch) { 
    this.order = orderMatch[1]; 
  } 
  this.result_ = new goog.testing.TestCase.Result(this); 
  var testRunnerMethods = { 
    isFinished: true, 
    hasErrors: true 
  }; 
}; 
goog.testing.TestCase.Order = { 
  NATURAL: 'natural', 
  RANDOM: 'random', 
  SORTED: 'sorted' 
}; 
goog.testing.TestCase.MAX_RUN_TIME = 200; 
goog.testing.TestCase.prototype.order = goog.testing.TestCase.Order.SORTED; 
goog.testing.TestCase.protectedTimeout_ = window.setTimeout; 
goog.testing.TestCase.setTimeoutAsString_ = String(window.setTimeout); 
goog.testing.TestCase.currentTestName = null; 
goog.testing.TestCase.IS_IE = typeof opera == 'undefined' && ! ! navigator && navigator.userAgent.indexOf('MSIE') != - 1; 
goog.testing.TestCase.prototype.started = false; 
goog.testing.TestCase.prototype.running = false; 
goog.testing.TestCase.prototype.startTime_ = 0; 
goog.testing.TestCase.prototype.batchTime_ = 0; 
goog.testing.TestCase.prototype.currentTestPointer_ = 0; 
goog.testing.TestCase.prototype.onCompleteCallback_ = null; 
goog.testing.TestCase.prototype.testRunner_ = null; 
goog.testing.TestCase.prototype.add = function(test) { 
  this.tests_.push(test); 
}; 
goog.testing.TestCase.prototype.setTests = function(tests) { 
  this.tests_ = tests; 
}; 
goog.testing.TestCase.prototype.getTests = function() { 
  return this.tests_; 
}; 
goog.testing.TestCase.prototype.getCount = function() { 
  return this.tests_.length; 
}; 
goog.testing.TestCase.prototype.next = function() { 
  var test; 
  while((test = this.tests_[this.currentTestPointer_ ++])) { 
    if(! this.testsToRun_ || this.testsToRun_[test.name]|| this.testsToRun_[this.currentTestPointer_ - 1]) { 
      return test; 
    } 
  } 
  return null; 
}; 
goog.testing.TestCase.prototype.reset = function() { 
  this.currentTestPointer_ = 0; 
  this.result_ = new goog.testing.TestCase.Result(this); 
}; 
goog.testing.TestCase.prototype.setCompletedCallback = function(fn) { 
  this.onCompleteCallback_ = fn; 
}; 
goog.testing.TestCase.prototype.setTestRunner = function(tr) { 
  this.testRunner_ = tr; 
}; 
goog.testing.TestCase.prototype.shouldRunTests = function() { 
  return true; 
}; 
goog.testing.TestCase.prototype.execute = function() { 
  this.started = true; 
  this.reset(); 
  this.startTime_ = this.now_(); 
  this.running = true; 
  this.result_.totalCount = this.getCount(); 
  if(! this.shouldRunTests()) { 
    this.log('shouldRunTests() returned false, skipping these tests.'); 
    this.result_.testSuppressed = true; 
    this.finalize(); 
    return; 
  } 
  this.log('Starting tests: ' + this.name_); 
  this.cycleTests(); 
}; 
goog.testing.TestCase.prototype.finalize = function() { 
  this.saveMessage('Done'); 
  this.tearDownPage(); 
  var restoredSetTimeout = goog.testing.TestCase.protectedTimeout_ == window.setTimeout; 
  if(! restoredSetTimeout && goog.testing.TestCase.IS_IE && String(window.setTimeout) == goog.testing.TestCase.setTimeoutAsString_) { 
    restoredSetTimeout = true; 
  } 
  if(! restoredSetTimeout) { 
    var message = 'ERROR: Test did not restore setTimeout'; 
    this.saveMessage(message); 
    var err = new goog.testing.TestCase.Error(this.name_, message); 
    this.result_.errors.push(err); 
  } 
  window.setTimeout = goog.testing.TestCase.protectedTimeout_; 
  this.endTime_ = this.now_(); 
  this.running = false; 
  this.result_.runTime = this.endTime_ - this.startTime_; 
  this.result_.numFilesLoaded = this.countNumFilesLoaded_(); 
  this.log(this.result_.getSummary()); 
  if(this.result_.isSuccess()) { 
    this.log('Tests complete'); 
  } else { 
    this.log('Tests Failed'); 
  } 
  if(this.onCompleteCallback_) { 
    var fn = this.onCompleteCallback_; 
    fn(); 
    this.onCompleteCallback_ = null; 
  } 
}; 
goog.testing.TestCase.prototype.saveMessage = function(message) { 
  this.result_.messages.push(this.getTimeStamp_() + '  ' + message); 
}; 
goog.testing.TestCase.prototype.isInsideMultiTestRunner = function() { 
  var top = goog.global['top']; 
  return top && typeof top['_allTests']!= 'undefined'; 
}; 
goog.testing.TestCase.prototype.log = function(val) { 
  if(! this.isInsideMultiTestRunner() && window.console) { 
    if(typeof val == 'string') { 
      val = this.getTimeStamp_() + ' : ' + val; 
    } 
    window.console.log(val); 
  } 
}; 
goog.testing.TestCase.prototype.isSuccess = function() { 
  return ! ! this.result_ && this.result_.isSuccess(); 
}; 
goog.testing.TestCase.prototype.getReport = function(opt_verbose) { 
  var rv =[]; 
  if(this.testRunner_ && ! this.testRunner_.isFinished()) { 
    rv.push(this.name_ + ' [RUNNING]'); 
  } else { 
    var success = this.result_.isSuccess() && ! this.testRunner_.hasErrors(); 
    rv.push(this.name_ + ' [' +(success ? 'PASSED': 'FAILED') + ']'); 
  } 
  rv.push(this.trimPath_(window.location.href)); 
  rv.push(this.result_.getSummary()); 
  if(opt_verbose) { 
    rv.push('.', this.result_.messages.join('\n')); 
  } else if(! this.result_.isSuccess()) { 
    rv.push(this.result_.errors.join('\n')); 
  } 
  rv.push(' '); 
  return rv.join('\n'); 
}; 
goog.testing.TestCase.prototype.getRunTime = function() { 
  return this.result_.runTime; 
}; 
goog.testing.TestCase.prototype.getNumFilesLoaded = function() { 
  return this.result_.numFilesLoaded; 
}; 
goog.testing.TestCase.prototype.runTests = function() { 
  this.setUpPage(); 
  this.execute(); 
}; 
goog.testing.TestCase.prototype.orderTests_ = function(tests) { 
  switch(this.order) { 
    case goog.testing.TestCase.Order.RANDOM: 
      var i = tests.length; 
      while(i > 1) { 
        var j = Math.floor(Math.random() * i); 
        i --; 
        var tmp = tests[i]; 
        tests[i]= tests[j]; 
        tests[j]= tmp; 
      } 
      break; 

    case goog.testing.TestCase.Order.SORTED: 
      tests.sort(function(t1, t2) { 
        if(t1.name == t2.name) { 
          return 0; 
        } 
        return t1.name < t2.name ? - 1: 1; 
      }); 
      break; 

  } 
}; 
goog.testing.TestCase.prototype.getGlobals = function(opt_prefix) { 
  return goog.testing.TestCase.getGlobals(opt_prefix); 
}; 
goog.testing.TestCase.getGlobals = function(opt_prefix) { 
  return typeof goog.global['RuntimeObject']!= 'undefined' ? goog.global['RuntimeObject']((opt_prefix || '') + '*'): goog.global; 
}; 
goog.testing.TestCase.prototype.setUpPage = function() { }; 
goog.testing.TestCase.prototype.tearDownPage = function() { }; 
goog.testing.TestCase.prototype.setUp = function() { }; 
goog.testing.TestCase.prototype.tearDown = function() { }; 
goog.testing.TestCase.prototype.getAutoDiscoveryPrefix = function() { 
  return 'test'; 
}; 
goog.testing.TestCase.prototype.getBatchTime = function() { 
  return this.batchTime_; 
}; 
goog.testing.TestCase.prototype.setBatchTime = function(batchTime) { 
  this.batchTime_ = batchTime; 
}; 
goog.testing.TestCase.prototype.createTestFromAutoDiscoveredFunction = function(name, ref) { 
  return new goog.testing.TestCase.Test(name, ref, goog.global); 
}; 
goog.testing.TestCase.prototype.autoDiscoverTests = function() { 
  var prefix = this.getAutoDiscoveryPrefix(); 
  var testSource = this.getGlobals(prefix); 
  var foundTests =[]; 
  for(var name in testSource) { 
    try { 
      var ref = testSource[name]; 
    } catch(ex) { } 
    if((new RegExp('^' + prefix)).test(name) && goog.isFunction(ref)) { 
      foundTests.push(this.createTestFromAutoDiscoveredFunction(name, ref)); 
    } 
  } 
  this.orderTests_(foundTests); 
  for(var i = 0; i < foundTests.length; i ++) { 
    this.add(foundTests[i]); 
  } 
  this.log(this.getCount() + ' tests auto-discovered'); 
  if(goog.global['setUp']) { 
    this.setUp = goog.bind(goog.global['setUp'], goog.global); 
  } 
  if(goog.global['tearDown']) { 
    this.tearDown = goog.bind(goog.global['tearDown'], goog.global); 
  } 
  if(goog.global['setUpPage']) { 
    this.setUpPage = goog.bind(goog.global['setUpPage'], goog.global); 
  } 
  if(goog.global['tearDownPage']) { 
    this.tearDownPage = goog.bind(goog.global['tearDownPage'], goog.global); 
  } 
  if(goog.global['runTests']) { 
    this.runTests = goog.bind(goog.global['runTests'], goog.global); 
  } 
  if(goog.global['shouldRunTests']) { 
    this.shouldRunTests = goog.bind(goog.global['shouldRunTests'], goog.global); 
  } 
}; 
goog.testing.TestCase.prototype.cycleTests = function() { 
  this.saveMessage('Start'); 
  this.batchTime_ = this.now_(); 
  var nextTest; 
  while((nextTest = this.next()) && this.running) { 
    this.result_.runCount ++; 
    var cleanedUp = false; 
    try { 
      this.log('Running test: ' + nextTest.name); 
      goog.testing.TestCase.currentTestName = nextTest.name; 
      this.setUp(); 
      nextTest.execute(); 
      this.tearDown(); 
      goog.testing.TestCase.currentTestName = null; 
      cleanedUp = true; 
      this.doSuccess(nextTest); 
    } catch(e) { 
      this.doError(nextTest, e); 
      if(! cleanedUp) { 
        try { 
          this.tearDown(); 
        } catch(e2) { } 
      } 
    } 
    if(this.currentTestPointer_ < this.tests_.length && this.now_() - this.batchTime_ > goog.testing.TestCase.MAX_RUN_TIME) { 
      this.saveMessage('Breaking async'); 
      this.timeout(goog.bind(this.cycleTests, this), 100); 
      return; 
    } 
  } 
  this.finalize(); 
}; 
goog.testing.TestCase.prototype.countNumFilesLoaded_ = function() { 
  var scripts = document.getElementsByTagName('script'); 
  var count = 0; 
  for(var i = 0, n = scripts.length; i < n; i ++) { 
    if(scripts[i].src) { 
      count ++; 
    } 
  } 
  return count; 
}; 
goog.testing.TestCase.prototype.timeout = function(fn, time) { 
  var protectedTimeout = goog.testing.TestCase.protectedTimeout_; 
  return protectedTimeout(fn, time); 
}; 
goog.testing.TestCase.prototype.now_ = function() { 
  return new Date().getTime(); 
}; 
goog.testing.TestCase.prototype.getTimeStamp_ = function() { 
  var d = new Date; 
  var millis = '00' + d.getMilliseconds(); 
  millis = millis.substr(millis.length - 3); 
  return this.pad_(d.getHours()) + ':' + this.pad_(d.getMinutes()) + ':' + this.pad_(d.getSeconds()) + '.' + millis; 
}; 
goog.testing.TestCase.prototype.pad_ = function(number) { 
  return number < 10 ? '0' + number: String(number); 
}; 
goog.testing.TestCase.prototype.trimPath_ = function(path) { 
  return path.substring(path.indexOf('google3') + 8); 
}; 
goog.testing.TestCase.prototype.doSuccess = function(test) { 
  this.result_.successCount ++; 
  var message = test.name + ' : PASSED'; 
  this.saveMessage(message); 
  this.log(message); 
}; 
goog.testing.TestCase.prototype.doError = function(test, opt_e) { 
  var message = test.name + ' : FAILED'; 
  this.log(message); 
  this.saveMessage(message); 
  var err = this.logError(test.name, opt_e); 
  this.result_.errors.push(err); 
}; 
goog.testing.TestCase.prototype.logError = function(name, opt_e) { 
  var errMsg = null; 
  var stack = null; 
  if(opt_e) { 
    this.log(opt_e); 
    if(goog.isString(opt_e)) { 
      errMsg = opt_e; 
    } else { 
      errMsg = opt_e.message || opt_e.description || opt_e.toString(); 
      stack = opt_e.stack ? goog.testing.stacktrace.canonicalize(opt_e.stack): opt_e['stackTrace']; 
    } 
  } else { 
    errMsg = 'An unknown error occurred'; 
  } 
  var err = new goog.testing.TestCase.Error(name, errMsg, stack); 
  if(! opt_e || ! opt_e['isJsUnitException']|| ! opt_e['loggedJsUnitException']) { 
    this.saveMessage(err.toString()); 
  } 
  if(opt_e && opt_e['isJsUnitException']) { 
    opt_e['loggedJsUnitException']= true; 
  } 
  return err; 
}; 
goog.testing.TestCase.Test = function(name, ref, opt_scope) { 
  this.name = name; 
  this.ref = ref; 
  this.scope = opt_scope || null; 
}; 
goog.testing.TestCase.Test.prototype.execute = function() { 
  this.ref.call(this.scope); 
}; 
goog.testing.TestCase.Result = function(testCase) { 
  this.testCase_ = testCase; 
  this.totalCount = 0; 
  this.runCount = 0; 
  this.successCount = 0; 
  this.runTime = 0; 
  this.numFilesLoaded = 0; 
  this.testSuppressed = false; 
  this.errors =[]; 
  this.messages =[]; 
}; 
goog.testing.TestCase.Result.prototype.isSuccess = function() { 
  var noErrors = this.runCount == this.successCount && this.errors.length == 0; 
  if(noErrors && ! this.testSuppressed && this.isStrict()) { 
    return this.runCount > 0; 
  } 
  return noErrors; 
}; 
goog.testing.TestCase.Result.prototype.getSummary = function() { 
  var summary = this.runCount + ' of ' + this.totalCount + ' tests run in ' + this.runTime + 'ms.\n'; 
  if(this.testSuppressed) { 
    summary += 'Tests not run because shouldRunTests() returned false.'; 
  } else if(this.runCount == 0) { 
    summary += 'No tests found.  '; 
    if(this.isStrict()) { 
      summary += 'Call G_testRunner.setStrict(false) if this is expected behavior.  '; 
    } 
  } else { 
    summary += this.successCount + ' passed, ' +(this.totalCount - this.successCount) + ' failed.\n' + Math.round(this.runTime / this.runCount) + ' ms/test. ' + this.numFilesLoaded + ' files loaded.'; 
  } 
  return summary; 
}; 
goog.testing.TestCase.initializeTestRunner = function(testCase) { 
  testCase.autoDiscoverTests(); 
  var gTestRunner = goog.global['G_testRunner']; 
  if(gTestRunner) { 
    gTestRunner.initialize(testCase); 
  } else { 
    throw Error('G_testRunner is undefined. Please ensure goog.testing.jsunit' + 'is included.'); 
  } 
}; 
goog.testing.TestCase.Result.prototype.isStrict = function() { 
  return this.testCase_.testRunner_.isStrict(); 
}; 
goog.testing.TestCase.Error = function(source, message, opt_stack) { 
  this.source = source; 
  this.message = message; 
  this.stack = opt_stack || null; 
}; 
goog.testing.TestCase.Error.prototype.toString = function() { 
  return 'ERROR in ' + this.source + '\n' + this.message +(this.stack ? '\n' + this.stack: ''); 
}; 

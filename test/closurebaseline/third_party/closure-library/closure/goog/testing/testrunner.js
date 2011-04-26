
goog.provide('goog.testing.TestRunner'); 
goog.require('goog.testing.TestCase'); 
goog.testing.TestRunner = function() { 
  this.errors =[]; 
}; 
goog.testing.TestRunner.prototype.testCase = null; 
goog.testing.TestRunner.prototype.initialized = false; 
goog.testing.TestRunner.prototype.logEl_ = null; 
goog.testing.TestRunner.prototype.errorFilter_ = null; 
goog.testing.TestRunner.prototype.strict_ = true; 
goog.testing.TestRunner.prototype.initialize = function(testCase) { 
  if(! this.logEl_) { 
    var el = document.getElementById('closureTestRunnerLog'); 
    if(el == null) { 
      el = document.createElement('div'); 
      document.body.appendChild(el); 
    } 
    this.logEl_ = el; 
  } 
  if(this.testCase && this.testCase.running) { 
    throw Error('The test runner is already waiting for a test to complete'); 
  } 
  this.testCase = testCase; 
  testCase.setTestRunner(this); 
  this.initialized = true; 
}; 
goog.testing.TestRunner.prototype.setStrict = function(strict) { 
  this.strict_ = strict; 
}; 
goog.testing.TestRunner.prototype.isStrict = function() { 
  return this.strict_; 
}; 
goog.testing.TestRunner.prototype.isInitialized = function() { 
  return this.initialized; 
}; 
goog.testing.TestRunner.prototype.isFinished = function() { 
  return this.errors.length > 0 || this.initialized && ! ! this.testCase && this.testCase.started && ! this.testCase.running; 
}; 
goog.testing.TestRunner.prototype.isSuccess = function() { 
  return ! this.hasErrors() && ! ! this.testCase && this.testCase.isSuccess(); 
}; 
goog.testing.TestRunner.prototype.hasErrors = function() { 
  return this.errors.length > 0; 
}; 
goog.testing.TestRunner.prototype.logError = function(msg) { 
  if(! this.errorFilter_ || this.errorFilter_.call(null, msg)) { 
    this.errors.push(msg); 
  } 
}; 
goog.testing.TestRunner.prototype.logTestFailure = function(ex) { 
  var testName = goog.testing.TestCase.currentTestName; 
  if(this.testCase) { 
    this.testCase.logError(testName, ex); 
  } else { 
    throw new Error('Test runner not initialized with a test case. Original ' + 'exception: ' + ex.message); 
  } 
}; 
goog.testing.TestRunner.prototype.setErrorFilter = function(fn) { 
  this.errorFilter_ = fn; 
}; 
goog.testing.TestRunner.prototype.getReport = function(opt_verbose) { 
  var report =[]; 
  if(this.testCase) { 
    report.push(this.testCase.getReport(opt_verbose)); 
  } 
  if(this.errors.length > 0) { 
    report.push('JavaScript errors detected by test runner:'); 
    report.push.apply(report, this.errors); 
    report.push('\n'); 
  } 
  return report.join('\n'); 
}; 
goog.testing.TestRunner.prototype.getRunTime = function() { 
  return this.testCase ? this.testCase.getRunTime(): 0; 
}; 
goog.testing.TestRunner.prototype.getNumFilesLoaded = function() { 
  return this.testCase ? this.testCase.getNumFilesLoaded(): 0; 
}; 
goog.testing.TestRunner.prototype.execute = function() { 
  if(! this.testCase) { 
    throw Error('The test runner must be initialized with a test case before ' + 'execute can be called.'); 
  } 
  this.testCase.setCompletedCallback(goog.bind(this.onComplete_, this)); 
  this.testCase.runTests(); 
}; 
goog.testing.TestRunner.prototype.onComplete_ = function() { 
  var log = this.testCase.getReport(true); 
  if(this.errors.length > 0) { 
    log += '\n' + this.errors.join('\n'); 
  } 
  var logEl = this.logEl_; 
  while(logEl.firstChild) { 
    logEl.removeChild(logEl.firstChild); 
  } 
  this.writeLog(log); 
  var runAgainLink = document.createElement('a'); 
  runAgainLink.style.display = 'block'; 
  runAgainLink.style.fontSize = 'small'; 
  runAgainLink.href = ''; 
  runAgainLink.onclick = goog.bind(function() { 
    this.execute(); 
    return false; 
  }, this); 
  runAgainLink.innerHTML = 'Run again without reloading'; 
  logEl.appendChild(runAgainLink); 
}; 
goog.testing.TestRunner.prototype.writeLog = function(log) { 
  var lines = log.split('\n'); 
  for(var i = 0; i < lines.length; i ++) { 
    var line = lines[i]; 
    var color; 
    var isFailOrError = /FAILED/.test(line) || /ERROR/.test(line); 
    if(/PASSED/.test(line)) { 
      color = 'darkgreen'; 
    } else if(isFailOrError) { 
      color = 'darkred'; 
    } else { 
      color = '#333'; 
    } 
    var div = document.createElement('div'); 
    if(line.substr(0, 2) == '> ') { 
      div.innerHTML = line; 
    } else { 
      div.appendChild(document.createTextNode(line)); 
    } 
    if(isFailOrError) { 
      var testNameMatch = /(\S+) (\[[^\]]*] )?: (FAILED|ERROR)/.exec(line); 
      if(testNameMatch) { 
        var newSearch = 'runTests=' + testNameMatch[1]; 
        var search = window.location.search; 
        if(search) { 
          var oldTests = /runTests=([^&]*)/.exec(search); 
          if(oldTests) { 
            newSearch = search.substr(0, oldTests.index) + newSearch + search.substr(oldTests.index + oldTests[0].length); 
          } else { 
            newSearch = search + '&' + newSearch; 
          } 
        } else { 
          newSearch = '?' + newSearch; 
        } 
        var href = window.location.href; 
        var hash = window.location.hash; 
        if(hash && hash.charAt(0) != '#') { 
          hash = '#' + hash; 
        } 
        href = href.split('#')[0].split('?')[0]+ newSearch + hash; 
        var a = document.createElement('A'); 
        a.innerHTML = '(run individually)'; 
        a.style.fontSize = '0.8em'; 
        a.href = href; 
        div.appendChild(document.createTextNode(' ')); 
        div.appendChild(a); 
      } 
    } 
    div.style.color = color; 
    div.style.font = 'normal 100% monospace'; 
    try { 
      div.style.whiteSpace = 'pre-wrap'; 
    } catch(e) { } 
    if(i < 2) { 
      div.style.fontWeight = 'bold'; 
    } 
    this.logEl_.appendChild(div); 
  } 
}; 
goog.testing.TestRunner.prototype.log = function(s) { 
  if(this.testCase) { 
    this.testCase.log(s); 
  } 
}; 

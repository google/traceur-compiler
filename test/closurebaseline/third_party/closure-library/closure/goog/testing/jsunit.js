
goog.provide('goog.testing.jsunit'); 
goog.require('goog.testing.TestCase'); 
goog.require('goog.testing.TestRunner'); 
goog.testing.jsunit.BASE_PATH = '../../third_party/java/jsunit/core/app/'; 
goog.testing.jsunit.CORE_SCRIPT = goog.testing.jsunit.BASE_PATH + 'jsUnitCore.js'; 
goog.testing.jsunit.AUTO_RUN_ONLOAD = true; 
(function() { 
  var realTimeout = window.setTimeout; 
  if(top['JsUnitTestManager']|| top['jsUnitTestManager']) { 
    var path = goog.basePath + goog.testing.jsunit.CORE_SCRIPT; 
    document.write('<script type="text/javascript" src="' + path + '"></' + 'script>'); 
  } else { 
    var tr = new goog.testing.TestRunner(); 
    goog.exportSymbol('G_testRunner', tr); 
    goog.exportSymbol('G_testRunner.initialize', tr.initialize); 
    goog.exportSymbol('G_testRunner.isInitialized', tr.isInitialized); 
    goog.exportSymbol('G_testRunner.isFinished', tr.isFinished); 
    goog.exportSymbol('G_testRunner.isSuccess', tr.isSuccess); 
    goog.exportSymbol('G_testRunner.getReport', tr.getReport); 
    goog.exportSymbol('G_testRunner.getRunTime', tr.getRunTime); 
    goog.exportSymbol('G_testRunner.getNumFilesLoaded', tr.getNumFilesLoaded); 
    goog.exportSymbol('G_testRunner.setStrict', tr.setStrict); 
    goog.exportSymbol('G_testRunner.logTestFailure', tr.logTestFailure); 
    if(! goog.global['debug']) { 
      goog.exportSymbol('debug', goog.bind(tr.log, tr)); 
    } 
    if(goog.global['G_errorFilter']) { 
      tr.setErrorFilter(goog.global['G_errorFilter']); 
    } 
    var onerror = window.onerror; 
    window.onerror = function(error, url, line) { 
      if(onerror) { 
        onerror(error, url, line); 
      } 
      if(typeof error == 'object') { 
        if(error.target && error.target.tagName == 'SCRIPT') { 
          tr.logError('UNKNOWN ERROR: Script ' + error.target.src); 
        } else { 
          tr.logError('UNKNOWN ERROR: No error information available.'); 
        } 
      } else { 
        tr.logError('JS ERROR: ' + error + '\nURL: ' + url + '\nLine: ' + line); 
      } 
    }; 
    if(goog.testing.jsunit.AUTO_RUN_ONLOAD) { 
      var onload = window.onload; 
      window.onload = function() { 
        if(onload) { 
          onload(); 
        } 
        realTimeout(function() { 
          if(! tr.initialized) { 
            var test = new goog.testing.TestCase(document.title); 
            test.autoDiscoverTests(); 
            tr.initialize(test); 
          } 
          tr.execute(); 
        }, 500); 
        window.onload = null; 
      }; 
    } 
  } 
})(); 

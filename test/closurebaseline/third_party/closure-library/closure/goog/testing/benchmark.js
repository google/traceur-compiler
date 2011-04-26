
goog.provide('goog.testing.benchmark'); 
goog.require('goog.dom'); 
goog.require('goog.dom.TagName'); 
goog.require('goog.testing.PerformanceTable'); 
goog.require('goog.testing.PerformanceTimer'); 
goog.require('goog.testing.TestCase'); 
goog.testing.benchmark.run_ = function() { 
  var times = 200; 
  var search = window.location.search; 
  var timesMatch = search.match(/(?:\?|&)times=([^?&]+)/i); 
  if(timesMatch) { 
    times = timesMatch[1]; 
  } 
  var prefix = 'benchmark'; 
  var testSource = goog.testing.TestCase.getGlobals(prefix); 
  var benchmarks = { }; 
  var names =[]; 
  for(var name in testSource) { 
    try { 
      var ref = testSource[name]; 
    } catch(ex) { } 
    if((new RegExp('^' + prefix)).test(name) && goog.isFunction(ref)) { 
      benchmarks[name]= ref; 
      names.push(name); 
    } 
  } 
  document.body.appendChild(goog.dom.createTextNode('Running ' + names.length + ' benchmarks ' + times + ' times each.')); 
  document.body.appendChild(goog.dom.createElement(goog.dom.TagName.BR)); 
  names.sort(); 
  var performanceTimer = new goog.testing.PerformanceTimer(times); 
  performanceTimer.setDiscardOutliers(true); 
  var performanceTable = new goog.testing.PerformanceTable(document.body, performanceTimer, 2); 
  for(var i = 0; i < names.length; i ++) { 
    performanceTable.run(benchmarks[names[i]], names[i]); 
  } 
}; 
window.onload = function() { 
  goog.testing.benchmark.run_(); 
}; 

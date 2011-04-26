
goog.provide('goog.testing.PerformanceTable'); 
goog.require('goog.dom'); 
goog.require('goog.testing.PerformanceTimer'); 
goog.testing.PerformanceTable = function(root, opt_timer, opt_precision) { 
  this.root_ = root; 
  this.precision_ = opt_precision || 0; 
  var timer = opt_timer; 
  if(! timer) { 
    timer = new goog.testing.PerformanceTimer(); 
    timer.setNumSamples(5); 
    timer.setDiscardOutliers(true); 
  } 
  this.timer_ = timer; 
  this.initRoot_(); 
}; 
goog.testing.PerformanceTable.prototype.getTimer = function() { 
  return this.timer_; 
}; 
goog.testing.PerformanceTable.prototype.initRoot_ = function() { 
  this.root_.innerHTML = '<table class="test-results" cellspacing="1">' + '  <thead>' + '    <tr>' + '      <th rowspan="2">Test Description</th>' + '      <th rowspan="2">Runs</th>' + '      <th colspan="4">Results (ms)</th>' + '    </tr>' + '    <tr>' + '      <th>Average</th>' + '      <th>Std Dev</th>' + '      <th>Minimum</th>' + '      <th>Maximum</th>' + '    </tr>' + '  </thead>' + '  <tbody>' + '  </tbody>' + '</table>'; 
}; 
goog.testing.PerformanceTable.prototype.getTableBody_ = function() { 
  return this.root_.getElementsByTagName(goog.dom.TagName.TBODY)[0]; 
}; 
goog.testing.PerformanceTable.prototype.round_ = function(num) { 
  var factor = Math.pow(10, this.precision_); 
  return String(Math.round(num * factor) / factor); 
}; 
goog.testing.PerformanceTable.prototype.run = function(fn, opt_desc) { 
  var results = this.timer_.run(fn); 
  var average = results['average']; 
  var standardDeviation = results['standardDeviation']; 
  var isSuspicious = average < 0 || standardDeviation > average * .5; 
  var resultsRow = goog.dom.createDom('tr', null, goog.dom.createDom('td', 'test-description', opt_desc || 'No description'), goog.dom.createDom('td', 'test-count', String(results['count'])), goog.dom.createDom('td', 'test-average', this.round_(average)), goog.dom.createDom('td', 'test-standard-deviation', this.round_(standardDeviation)), goog.dom.createDom('td', 'test-minimum', String(results['minimum'])), goog.dom.createDom('td', 'test-maximum', String(results['maximum']))); 
  if(isSuspicious) { 
    resultsRow.className = 'test-suspicious'; 
  } 
  this.getTableBody_().appendChild(resultsRow); 
}; 
goog.testing.PerformanceTable.prototype.reportError = function(reason) { 
  this.getTableBody_().appendChild(goog.dom.createDom('tr', null, goog.dom.createDom('td', { 
    'class': 'test-error', 
    'colSpan': 5 
  }, String(reason)))); 
}; 


goog.provide('goog.testing.PerformanceTimer'); 
goog.require('goog.array'); 
goog.require('goog.math'); 
goog.testing.PerformanceTimer = function(opt_numSamples, opt_timeoutInterval) { 
  this.numSamples_ = opt_numSamples || 10; 
  this.timeoutInterval_ = opt_timeoutInterval || 5000; 
  this.discardOutliers_ = false; 
}; 
goog.testing.PerformanceTimer.prototype.getNumSamples = function() { 
  return this.numSamples_; 
}; 
goog.testing.PerformanceTimer.prototype.setNumSamples = function(numSamples) { 
  this.numSamples_ = numSamples; 
}; 
goog.testing.PerformanceTimer.prototype.getTimeoutInterval = function() { 
  return this.timeoutInterval_; 
}; 
goog.testing.PerformanceTimer.prototype.setTimeoutInterval = function(timeoutInterval) { 
  this.timeoutInterval_ = timeoutInterval; 
}; 
goog.testing.PerformanceTimer.prototype.setDiscardOutliers = function(discard) { 
  this.discardOutliers_ = discard; 
}; 
goog.testing.PerformanceTimer.prototype.isDiscardOutliers = function() { 
  return this.discardOutliers_; 
}; 
goog.testing.PerformanceTimer.prototype.run = function(testFn) { 
  var samples =[]; 
  var testStart = goog.now(); 
  for(var i = 0; i < this.numSamples_; i ++) { 
    var sampleStart = goog.now(); 
    testFn(); 
    var sampleEnd = goog.now(); 
    samples[i]= sampleEnd - sampleStart; 
    if(sampleEnd - testStart > this.timeoutInterval_) { 
      break; 
    } 
  } 
  if(this.discardOutliers_ && samples.length > 2) { 
    goog.array.remove(samples, Math.min.apply(null, samples)); 
    goog.array.remove(samples, Math.max.apply(null, samples)); 
  } 
  return { 
    'average': goog.math.average.apply(null, samples), 
    'count': i, 
    'maximum': Math.max.apply(null, samples), 
    'minimum': Math.min.apply(null, samples), 
    'standardDeviation': goog.math.standardDeviation.apply(null, samples), 
    'total': goog.math.sum.apply(null, samples) 
  }; 
}; 

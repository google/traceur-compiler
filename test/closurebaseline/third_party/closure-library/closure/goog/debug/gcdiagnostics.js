
goog.provide('goog.debug.GcDiagnostics'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.debug.Trace'); 
goog.require('goog.userAgent'); 
goog.debug.GcDiagnostics_ = function() { }; 
goog.debug.GcDiagnostics_.prototype.install = function() { 
  if(goog.userAgent.IE) { 
    try { 
      var l2Helper = new ActiveXObject('L2.NativeHelper'); 
      if(goog.debug.Trace_) { 
        goog.debug.Trace_.now = function() { 
          return l2Helper['getMilliSeconds'](); 
        }; 
      } 
      if(l2Helper['gcTracer']) { 
        l2Helper['gcTracer']['installGcTracing'](); 
        this.gcTracer_ = l2Helper['gcTracer']; 
        if(goog.debug.Trace) { 
          goog.debug.Trace.setGcTracer(this.gcTracer_); 
        } 
      } 
      this.logger_.info('Installed L2 native helper'); 
    } catch(e) { 
      this.logger_.info('Failed to install L2 native helper: ' + e); 
    } 
  } 
}; 
goog.debug.GcDiagnostics_.prototype.logger_ = goog.debug.Logger.getLogger('goog.debug.GcDiagnostics'); 
goog.debug.GcDiagnostics_.prototype.start = function() { 
  if(this.gcTracer_) { 
    if(this.gcTracer_['isTracing']()) { 
      this.gcTracer_['endGcTracing'](); 
    } 
    this.gcTracer_['startGcTracing'](); 
  } 
}; 
goog.debug.GcDiagnostics_.prototype.stop = function() { 
  if(this.gcTracer_ && this.gcTracer_['isTracing']()) { 
    var gcTracer = this.gcTracer_; 
    this.gcTracer_['endGcTracing'](); 
    var numGCs = gcTracer['getNumTraces'](); 
    this.logger_.info('*********GC TRACE*********'); 
    this.logger_.info('GC ran ' + numGCs + ' times.'); 
    var totalTime = 0; 
    for(var i = 0; i < numGCs; i ++) { 
      var trace = gcTracer['getTrace'](i); 
      var msStart = trace['gcStartTime']; 
      var msElapsed = trace['gcElapsedTime']; 
      var msRounded = Math.round(msElapsed * 10) / 10; 
      var s = 'GC ' + i + ': ' + msRounded + ' ms, ' + 'numVValAlloc=' + trace['numVValAlloc']+ ', ' + 'numVarAlloc=' + trace['numVarAlloc']+ ', ' + 'numBytesSysAlloc=' + trace['numBytesSysAlloc']; 
      if(goog.debug.Trace) { 
        goog.debug.Trace.addComment(s, null, msStart); 
      } 
      this.logger_.info(s); 
      totalTime += msElapsed; 
    } 
    if(goog.debug.Trace) { 
      goog.debug.Trace.addComment('Total GC time was ' + totalTime + ' ms.'); 
    } 
    this.logger_.info('Total GC time was ' + totalTime + ' ms.'); 
    this.logger_.info('*********GC TRACE*********'); 
  } 
}; 
goog.debug.GcDiagnostics = new goog.debug.GcDiagnostics_(); 

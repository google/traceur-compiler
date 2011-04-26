
goog.provide('goog.debug.Trace'); 
goog.require('goog.array'); 
goog.require('goog.debug.Logger'); 
goog.require('goog.iter'); 
goog.require('goog.structs.Map'); 
goog.require('goog.structs.SimplePool'); 
goog.debug.Trace_ = function() { 
  this.events_ =[]; 
  this.outstandingEvents_ = new goog.structs.Map(); 
  this.startTime_ = 0; 
  this.tracerOverheadStart_ = 0; 
  this.tracerOverheadEnd_ = 0; 
  this.tracerOverheadComment_ = 0; 
  this.stats_ = new goog.structs.Map(); 
  this.tracerCount_ = 0; 
  this.commentCount_ = 0; 
  this.nextId_ = 1; 
  this.eventPool_ = new goog.structs.SimplePool(0, 4000); 
  this.eventPool_.createObject = function() { 
    return new goog.debug.Trace_.Event_(); 
  }; 
  this.statPool_ = new goog.structs.SimplePool(0, 50); 
  this.statPool_.createObject = function() { 
    return new goog.debug.Trace_.Stat_(); 
  }; 
  var that = this; 
  this.idPool_ = new goog.structs.SimplePool(0, 2000); 
  this.idPool_.createObject = function() { 
    return String(that.nextId_ ++); 
  }; 
  this.idPool_.disposeObject = function(obj) { }; 
  this.defaultThreshold_ = 3; 
}; 
goog.debug.Trace_.prototype.logger_ = goog.debug.Logger.getLogger('goog.debug.Trace'); 
goog.debug.Trace_.prototype.MAX_TRACE_SIZE = 1000; 
goog.debug.Trace_.EventType = { 
  START: 0, 
  STOP: 1, 
  COMMENT: 2 
}; 
goog.debug.Trace_.Stat_ = function() { 
  this.count = 0; 
  this.time = 0; 
  this.varAlloc = 0; 
}; 
goog.debug.Trace_.Stat_.prototype.toString = function() { 
  var sb =[]; 
  sb.push(this.type, ' ', this.count, ' (', Math.round(this.time * 10) / 10, ' ms)'); 
  if(this.varAlloc) { 
    sb.push(' [VarAlloc = ', this.varAlloc, ']'); 
  } 
  return sb.join(''); 
}; 
goog.debug.Trace_.Event_ = function() { }; 
goog.debug.Trace_.Event_.prototype.toTraceString = function(startTime, prevTime, indent) { 
  var sb =[]; 
  if(prevTime == - 1) { 
    sb.push('    '); 
  } else { 
    sb.push(goog.debug.Trace_.longToPaddedString_(this.eventTime - prevTime)); 
  } 
  sb.push(' ', goog.debug.Trace_.formatTime_(this.eventTime - startTime)); 
  if(this.eventType == goog.debug.Trace_.EventType.START) { 
    sb.push(' Start        '); 
  } else if(this.eventType == goog.debug.Trace_.EventType.STOP) { 
    sb.push(' Done '); 
    var delta = this.stopTime - this.startTime; 
    sb.push(goog.debug.Trace_.longToPaddedString_(delta), ' ms '); 
  } else { 
    sb.push(' Comment      '); 
  } 
  sb.push(indent, this); 
  if(this.totalVarAlloc > 0) { 
    sb.push('[VarAlloc ', this.totalVarAlloc, '] '); 
  } 
  return sb.join(''); 
}; 
goog.debug.Trace_.Event_.prototype.toString = function() { 
  if(this.type == null) { 
    return this.comment; 
  } else { 
    return '[' + this.type + '] ' + this.comment; 
  } 
}; 
goog.debug.Trace_.prototype.setStartTime = function(startTime) { 
  this.startTime_ = startTime; 
}; 
goog.debug.Trace_.prototype.initCurrentTrace = function(defaultThreshold) { 
  this.reset(defaultThreshold); 
}; 
goog.debug.Trace_.prototype.clearCurrentTrace = function() { 
  this.reset(0); 
}; 
goog.debug.Trace_.prototype.reset = function(defaultThreshold) { 
  this.defaultThreshold_ = defaultThreshold; 
  for(var i = 0; i < this.events_.length; i ++) { 
    var id =(this.eventPool_).id; 
    if(id) { 
      this.idPool_.releaseObject(id); 
    } 
    this.eventPool_.releaseObject(this.events_[i]); 
  } 
  this.events_.length = 0; 
  this.outstandingEvents_.clear(); 
  this.startTime_ = goog.debug.Trace_.now(); 
  this.tracerOverheadStart_ = 0; 
  this.tracerOverheadEnd_ = 0; 
  this.tracerOverheadComment_ = 0; 
  this.tracerCount_ = 0; 
  this.commentCount_ = 0; 
  var keys = this.stats_.getKeys(); 
  for(var i = 0; i < keys.length; i ++) { 
    var key = keys[i]; 
    var stat = this.stats_.get(key); 
    stat.count = 0; 
    stat.time = 0; 
    stat.varAlloc = 0; 
    this.statPool_.releaseObject((stat)); 
  } 
  this.stats_.clear(); 
}; 
goog.debug.Trace_.prototype.startTracer = function(comment, opt_type) { 
  var tracerStartTime = goog.debug.Trace_.now(); 
  var varAlloc = this.getTotalVarAlloc(); 
  var outstandingEventCount = this.outstandingEvents_.getCount(); 
  if(this.events_.length + outstandingEventCount > this.MAX_TRACE_SIZE) { 
    this.logger_.warning('Giant thread trace. Clearing to ' + 'avoid memory leak.'); 
    if(this.events_.length > this.MAX_TRACE_SIZE / 2) { 
      for(var i = 0; i < this.events_.length; i ++) { 
        var event = this.events_[i]; 
        if(event.id) { 
          this.idPool_.releaseObject(event.id); 
        } 
        this.eventPool_.releaseObject(event); 
      } 
      this.events_.length = 0; 
    } 
    if(outstandingEventCount > this.MAX_TRACE_SIZE / 2) { 
      this.outstandingEvents_.clear(); 
    } 
  } 
  this.logToProfilers_('Start : ' + comment); 
  var event =(this.eventPool_.getObject()); 
  event.totalVarAlloc = varAlloc; 
  event.eventType = goog.debug.Trace_.EventType.START; 
  event.id = Number(this.idPool_.getObject()); 
  event.comment = comment; 
  event.type = opt_type; 
  this.events_.push(event); 
  this.outstandingEvents_.set(String(event.id), event); 
  this.tracerCount_ ++; 
  var now = goog.debug.Trace_.now(); 
  event.startTime = event.eventTime = now; 
  this.tracerOverheadStart_ += now - tracerStartTime; 
  return event.id; 
}; 
goog.debug.Trace_.prototype.stopTracer = function(id, opt_silenceThreshold) { 
  var now = goog.debug.Trace_.now(); 
  var silenceThreshold; 
  if(opt_silenceThreshold === 0) { 
    silenceThreshold = 0; 
  } else if(opt_silenceThreshold) { 
    silenceThreshold = opt_silenceThreshold; 
  } else { 
    silenceThreshold = this.defaultThreshold_; 
  } 
  var startEvent = this.outstandingEvents_.get(String(id)); 
  if(startEvent == null) { 
    return null; 
  } 
  this.outstandingEvents_.remove(String(id)); 
  var stopEvent; 
  var elapsed = now - startEvent.startTime; 
  if(elapsed < silenceThreshold) { 
    var count = this.events_.length; 
    for(var i = count - 1; i >= 0; i --) { 
      var nextEvent = this.events_[i]; 
      if(nextEvent == startEvent) { 
        this.events_.splice(i, 1); 
        this.idPool_.releaseObject(startEvent.id); 
        this.eventPool_.releaseObject((startEvent)); 
        break; 
      } 
    } 
  } else { 
    stopEvent =(this.eventPool_.getObject()); 
    stopEvent.eventType = goog.debug.Trace_.EventType.STOP; 
    stopEvent.startTime = startEvent.startTime; 
    stopEvent.comment = startEvent.comment; 
    stopEvent.type = startEvent.type; 
    stopEvent.stopTime = stopEvent.eventTime = now; 
    this.events_.push(stopEvent); 
  } 
  var type = startEvent.type; 
  var stat = null; 
  if(type) { 
    stat = this.getStat_(type); 
    stat.count ++; 
    stat.time += elapsed; 
  } 
  if(stopEvent) { 
    this.logToProfilers_('Stop : ' + stopEvent.comment); 
    stopEvent.totalVarAlloc = this.getTotalVarAlloc(); 
    if(stat) { 
      stat.varAlloc +=(stopEvent.totalVarAlloc - startEvent.totalVarAlloc); 
    } 
  } 
  var tracerFinishTime = goog.debug.Trace_.now(); 
  this.tracerOverheadEnd_ += tracerFinishTime - now; 
  return elapsed; 
}; 
goog.debug.Trace_.prototype.setGcTracer = function(gcTracer) { 
  this.gcTracer_ = gcTracer; 
}; 
goog.debug.Trace_.prototype.getTotalVarAlloc = function() { 
  var gcTracer = this.gcTracer_; 
  if(gcTracer && gcTracer['isTracing']()) { 
    return gcTracer['totalVarAlloc']; 
  } 
  return - 1; 
}; 
goog.debug.Trace_.prototype.addComment = function(comment, opt_type, opt_timeStamp) { 
  var now = goog.debug.Trace_.now(); 
  var timeStamp = opt_timeStamp ? opt_timeStamp: now; 
  var eventComment =(this.eventPool_.getObject()); 
  eventComment.eventType = goog.debug.Trace_.EventType.COMMENT; 
  eventComment.eventTime = timeStamp; 
  eventComment.type = opt_type; 
  eventComment.comment = comment; 
  eventComment.totalVarAlloc = this.getTotalVarAlloc(); 
  this.commentCount_ ++; 
  if(opt_timeStamp) { 
    var numEvents = this.events_.length; 
    for(var i = 0; i < numEvents; i ++) { 
      var event = this.events_[i]; 
      var eventTime = event.eventTime; 
      if(eventTime > timeStamp) { 
        goog.array.insertAt(this.events_, eventComment, i); 
        break; 
      } 
    } 
    if(i == numEvents) { 
      this.events_.push(eventComment); 
    } 
  } else { 
    this.events_.push(eventComment); 
  } 
  var type = eventComment.type; 
  if(type) { 
    var stat = this.getStat_(type); 
    stat.count ++; 
  } 
  this.tracerOverheadComment_ += goog.debug.Trace_.now() - now; 
}; 
goog.debug.Trace_.prototype.getStat_ = function(type) { 
  var stat = this.stats_.get(type); 
  if(! stat) { 
    stat =(this.statPool_.getObject()); 
    stat.type = type; 
    this.stats_.set(type, stat); 
  } 
  return(stat); 
}; 
goog.debug.Trace_.prototype.getFormattedTrace = function() { 
  return this.toString(); 
}; 
goog.debug.Trace_.prototype.toString = function() { 
  var sb =[]; 
  var etime = - 1; 
  var indent =[]; 
  for(var i = 0; i < this.events_.length; i ++) { 
    var e = this.events_[i]; 
    if(e.eventType == goog.debug.Trace_.EventType.STOP) { 
      indent.pop(); 
    } 
    sb.push(' ', e.toTraceString(this.startTime_, etime, indent.join(''))); 
    etime = e.eventTime; 
    sb.push('\n'); 
    if(e.eventType == goog.debug.Trace_.EventType.START) { 
      indent.push('|  '); 
    } 
  } 
  if(this.outstandingEvents_.getCount() != 0) { 
    var now = goog.debug.Trace_.now(); 
    sb.push(' Unstopped timers:\n'); 
    goog.iter.forEach(this.outstandingEvents_, function(startEvent) { 
      sb.push('  ', startEvent, ' (', now - startEvent.startTime, ' ms, started at ', goog.debug.Trace_.formatTime_(startEvent.startTime), ')\n'); 
    }); 
  } 
  var statKeys = this.stats_.getKeys(); 
  for(var i = 0; i < statKeys.length; i ++) { 
    var stat = this.stats_.get(statKeys[i]); 
    if(stat.count > 1) { 
      sb.push(' TOTAL ', stat, '\n'); 
    } 
  } 
  sb.push('Total tracers created ', this.tracerCount_, '\n', 'Total comments created ', this.commentCount_, '\n', 'Overhead start: ', this.tracerOverheadStart_, ' ms\n', 'Overhead end: ', this.tracerOverheadEnd_, ' ms\n', 'Overhead comment: ', this.tracerOverheadComment_, ' ms\n'); 
  return sb.join(''); 
}; 
goog.debug.Trace_.prototype.logToProfilers_ = function(msg) { 
  this.logToSpeedTracer_(msg); 
  this.logToMsProfiler_(msg); 
}; 
goog.debug.Trace_.prototype.logToSpeedTracer_ = function(msg) { 
  if(goog.global['console']&& goog.global['console']['markTimeline']) { 
    goog.global['console']['markTimeline'](msg); 
  } 
}; 
goog.debug.Trace_.prototype.logToMsProfiler_ = function(msg) { 
  if(goog.global['msWriteProfilerMark']) { 
    goog.global['msWriteProfilerMark'](msg); 
  } 
}; 
goog.debug.Trace_.longToPaddedString_ = function(v) { 
  v = Math.round(v); 
  var space = ''; 
  if(v < 1000) space = ' '; 
  if(v < 100) space = '  '; 
  if(v < 10) space = '   '; 
  return space + v; 
}; 
goog.debug.Trace_.formatTime_ = function(time) { 
  time = Math.round(time); 
  var sec =(time / 1000) % 60; 
  var ms = time % 1000; 
  return String(100 + sec).substring(1, 3) + '.' + String(1000 + ms).substring(1, 4); 
}; 
goog.debug.Trace_.now = function() { 
  return goog.now(); 
}; 
goog.debug.Trace = new goog.debug.Trace_(); 

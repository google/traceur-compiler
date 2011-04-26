
goog.provide('goog.async.DeferredList'); 
goog.require('goog.array'); 
goog.require('goog.async.Deferred'); 
goog.async.DeferredList = function(list, opt_fireOnOneCallback, opt_fireOnOneErrback, opt_consumeErrors, opt_canceller, opt_defaultScope) { 
  goog.async.Deferred.call(this, opt_canceller, opt_defaultScope); 
  this.list_ = list; 
  this.deferredResults_ =[]; 
  this.fireOnOneCallback_ = ! ! opt_fireOnOneCallback; 
  this.fireOnOneErrback_ = ! ! opt_fireOnOneErrback; 
  this.consumeErrors_ = ! ! opt_consumeErrors; 
  for(var i = 0; i < list.length; i ++) { 
    var d = list[i]; 
    d.addCallbacks(goog.bind(this.handleCallback_, this, i, true), goog.bind(this.handleCallback_, this, i, false)); 
  } 
  if(list.length == 0 && ! this.fireOnOneCallback_) { 
    this.callback(this.deferredResults_); 
  } 
}; 
goog.inherits(goog.async.DeferredList, goog.async.Deferred); 
goog.async.DeferredList.prototype.numFinished_ = 0; 
goog.async.DeferredList.prototype.handleCallback_ = function(index, success, result) { 
  this.numFinished_ ++; 
  this.deferredResults_[index]=[success, result]; 
  if(! this.hasFired()) { 
    if(this.fireOnOneCallback_ && success) { 
      this.callback([index, result]); 
    } else if(this.fireOnOneErrback_ && ! success) { 
      this.errback(result); 
    } else if(this.numFinished_ == this.list_.length) { 
      this.callback(this.deferredResults_); 
    } 
  } 
  if(this.consumeErrors_ && ! success) { 
    result = null; 
  } 
  return result; 
}; 
goog.async.DeferredList.prototype.errback = function(res) { 
  goog.async.DeferredList.superClass_.errback.call(this, res); 
  goog.array.forEach(this.list_, function(item) { 
    item.cancel(); 
  }); 
}; 
goog.async.DeferredList.gatherResults = function(list) { 
  var d = new goog.async.DeferredList(list, false, true); 
  d.addCallback(function(results) { 
    return goog.array.map(results, function(res) { 
      return res[1]; 
    }); 
  }); 
  return d; 
}; 

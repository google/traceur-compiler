
goog.provide('goog.pubsub.PubSub'); 
goog.require('goog.Disposable'); 
goog.require('goog.array'); 
goog.pubsub.PubSub = function() { 
  goog.Disposable.call(this); 
  this.subscriptions_ =[]; 
  this.topics_ = { }; 
}; 
goog.inherits(goog.pubsub.PubSub, goog.Disposable); 
goog.pubsub.PubSub.prototype.subscriptions_; 
goog.pubsub.PubSub.prototype.key_ = 1; 
goog.pubsub.PubSub.prototype.topics_; 
goog.pubsub.PubSub.prototype.pendingKeys_; 
goog.pubsub.PubSub.prototype.publishDepth_ = 0; 
goog.pubsub.PubSub.prototype.subscribe = function(topic, fn, opt_context) { 
  var keys = this.topics_[topic]; 
  if(! keys) { 
    keys = this.topics_[topic]=[]; 
  } 
  var key = this.key_; 
  this.subscriptions_[key]= topic; 
  this.subscriptions_[key + 1]= fn; 
  this.subscriptions_[key + 2]= opt_context; 
  this.key_ = key + 3; 
  keys.push(key); 
  return key; 
}; 
goog.pubsub.PubSub.prototype.subscribeOnce = function(topic, fn, opt_context) { 
  var key = this.subscribe(topic, function(var_args) { 
    fn.apply(opt_context, arguments); 
    this.unsubscribeByKey(key); 
  }, this); 
  return key; 
}; 
goog.pubsub.PubSub.prototype.unsubscribe = function(topic, fn, opt_context) { 
  var keys = this.topics_[topic]; 
  if(keys) { 
    var subscriptions = this.subscriptions_; 
    var key = goog.array.find(keys, function(k) { 
      return subscriptions[k + 1]== fn && subscriptions[k + 2]== opt_context; 
    }); 
    if(key) { 
      return this.unsubscribeByKey((key)); 
    } 
  } 
  return false; 
}; 
goog.pubsub.PubSub.prototype.unsubscribeByKey = function(key) { 
  if(this.publishDepth_ != 0) { 
    if(! this.pendingKeys_) { 
      this.pendingKeys_ =[]; 
    } 
    this.pendingKeys_.push(key); 
    return false; 
  } 
  var topic = this.subscriptions_[key]; 
  if(topic) { 
    var keys = this.topics_[topic]; 
    if(keys) { 
      goog.array.remove(keys, key); 
    } 
    delete this.subscriptions_[key]; 
    delete this.subscriptions_[key + 1]; 
    delete this.subscriptions_[key + 2]; 
  } 
  return ! ! topic; 
}; 
goog.pubsub.PubSub.prototype.publish = function(topic, var_args) { 
  var keys = this.topics_[topic]; 
  if(keys) { 
    this.publishDepth_ ++; 
    var args = goog.array.slice(arguments, 1); 
    for(var i = 0, len = keys.length; i < len; i ++) { 
      var key = keys[i]; 
      this.subscriptions_[key + 1].apply(this.subscriptions_[key + 2], args); 
    } 
    this.publishDepth_ --; 
    if(this.pendingKeys_ && this.publishDepth_ == 0) { 
      var pendingKey; 
      while((pendingKey = this.pendingKeys_.pop())) { 
        this.unsubscribeByKey(pendingKey); 
      } 
    } 
    return i != 0; 
  } 
  return false; 
}; 
goog.pubsub.PubSub.prototype.clear = function(opt_topic) { 
  if(opt_topic) { 
    var keys = this.topics_[opt_topic]; 
    if(keys) { 
      goog.array.forEach(keys, this.unsubscribeByKey, this); 
      delete this.topics_[opt_topic]; 
    } 
  } else { 
    this.subscriptions_.length = 0; 
    this.topics_ = { }; 
  } 
}; 
goog.pubsub.PubSub.prototype.getCount = function(opt_topic) { 
  if(opt_topic) { 
    var keys = this.topics_[opt_topic]; 
    return keys ? keys.length: 0; 
  } 
  var count = 0; 
  for(var topic in this.topics_) { 
    count += this.getCount(topic); 
  } 
  return count; 
}; 
goog.pubsub.PubSub.prototype.disposeInternal = function() { 
  goog.pubsub.PubSub.superClass_.disposeInternal.call(this); 
  delete this.subscriptions_; 
  delete this.topics_; 
  delete this.pendingKeys_; 
}; 

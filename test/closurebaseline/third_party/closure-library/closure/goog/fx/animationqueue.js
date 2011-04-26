
goog.provide('goog.fx.AnimationParallelQueue'); 
goog.provide('goog.fx.AnimationQueue'); 
goog.provide('goog.fx.AnimationSerialQueue'); 
goog.require('goog.array'); 
goog.require('goog.events.EventHandler'); 
goog.require('goog.fx.Animation'); 
goog.require('goog.fx.Animation.EventType'); 
goog.fx.AnimationQueue = function() { 
  goog.fx.Animation.call(this,[0],[0], 0); 
  this.queue_ =[]; 
}; 
goog.inherits(goog.fx.AnimationQueue, goog.fx.Animation); 
goog.fx.AnimationQueue.prototype.onResume = function() { 
  this.executeChildrenAction(function(anim) { 
    anim.play(anim.progress == 0); 
  }); 
  goog.fx.AnimationQueue.superClass_.onResume.call(this); 
}; 
goog.fx.AnimationQueue.prototype.onStop = function() { 
  this.executeChildrenAction(function(anim) { 
    anim.stop(); 
  }); 
  goog.fx.AnimationQueue.superClass_.onStop.call(this); 
}; 
goog.fx.AnimationQueue.prototype.onPause = function() { 
  this.executeChildrenAction(function(anim) { 
    anim.pause(); 
  }); 
  goog.fx.AnimationQueue.superClass_.onPause.call(this); 
}; 
goog.fx.AnimationQueue.prototype.onDestroy = function() { 
  this.destroyQueueAndHandlers_(); 
  goog.fx.AnimationQueue.superClass_.onDestroy.call(this); 
}; 
goog.fx.AnimationQueue.prototype.executeChildrenAction = goog.abstractMethod; 
goog.fx.AnimationQueue.prototype.add = goog.abstractMethod; 
goog.fx.AnimationQueue.prototype.remove = goog.abstractMethod; 
goog.fx.AnimationQueue.prototype.destroyQueueAndHandlers_ = function() { 
  goog.array.forEach(this.queue_, function(element) { 
    element.destroy(); 
  }); 
}; 
goog.fx.AnimationParallelQueue = function() { 
  goog.fx.AnimationQueue.call(this); 
}; 
goog.inherits(goog.fx.AnimationParallelQueue, goog.fx.AnimationQueue); 
goog.fx.AnimationParallelQueue.prototype.playAll_ = function() { 
  for(var i = 0; i < this.queue_.length; i ++) { 
    this.queue_[i].play(); 
  } 
}; 
goog.fx.AnimationParallelQueue.prototype.onBegin = function() { 
  this.playAll_(); 
  goog.fx.AnimationParallelQueue.superClass_.onBegin.call(this); 
}; 
goog.fx.AnimationParallelQueue.prototype.executeChildrenAction = function(f) { 
  goog.array.forEach(this.queue_, f); 
}; 
goog.fx.AnimationParallelQueue.prototype.add = function(animation) { 
  this.queue_.push(animation); 
  this.duration = Math.max(this.duration, animation.duration); 
}; 
goog.fx.AnimationParallelQueue.prototype.remove = function(animation) { 
  if(goog.array.remove(this.queue_, animation)) { 
    if(animation.duration == this.duration) { 
      this.duration = 0; 
      goog.array.forEach(this.queue_, function(element) { 
        this.duration = Math.max(element.duration, this.duration); 
      }, this); 
    } 
  } 
}; 
goog.fx.AnimationSerialQueue = function() { 
  goog.fx.AnimationQueue.call(this); 
  this.childHandler_ = new goog.events.EventHandler(this); 
}; 
goog.inherits(goog.fx.AnimationSerialQueue, goog.fx.AnimationQueue); 
goog.fx.AnimationSerialQueue.prototype.counter_ = 0; 
goog.fx.AnimationSerialQueue.prototype.onBegin = function() { 
  this.playNext_(); 
  goog.fx.AnimationSerialQueue.superClass_.onBegin.call(this); 
}; 
goog.fx.AnimationSerialQueue.prototype.onEnd = function() { 
  this.reset_(); 
  goog.fx.AnimationSerialQueue.superClass_.onEnd.call(this); 
}; 
goog.fx.AnimationSerialQueue.prototype.reset_ = function() { 
  this.counter_ = 0; 
  this.childHandler_.removeAll(); 
}; 
goog.fx.AnimationSerialQueue.prototype.playNext_ = function() { 
  if(this.getStateInternal() == goog.fx.Animation.State.PAUSED) { 
    this.reset_(); 
    goog.array.forEach(this.queue_, function(animation) { 
      animation.progress = 0; 
      animation.updateCoords_(animation.progress); 
      animation.stop(); 
    }); 
  } 
  this.queue_[this.counter_].play(); 
  this.counter_ ++; 
  if(this.counter_ < this.queue_.length) { 
    this.childHandler_.listen(this.queue_[this.counter_ - 1], goog.fx.Animation.EventType.FINISH, function() { 
      this.playNext_(); 
    }); 
  } 
}; 
goog.fx.AnimationSerialQueue.prototype.add = function(animation) { 
  this.queue_.push(animation); 
  this.duration += animation.duration; 
}; 
goog.fx.AnimationSerialQueue.prototype.remove = function(animation) { 
  if(goog.array.remove(this.queue_, animation)) { 
    this.duration -= animation.duration; 
  } 
}; 
goog.fx.AnimationSerialQueue.prototype.executeChildrenAction = function(f) { 
  if(this.counter_ > 0) { 
    f(this.queue_[this.counter_ - 1]); 
  } 
}; 
goog.fx.AnimationSerialQueue.prototype.destroyQueueAndHandlers_ = function() { 
  goog.array.forEach(this.queue_, function(element) { 
    element.destroy(); 
  }); 
  this.childHandler_.dispose(); 
}; 

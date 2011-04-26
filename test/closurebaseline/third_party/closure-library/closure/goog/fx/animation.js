
goog.provide('goog.fx.Animation'); 
goog.provide('goog.fx.Animation.EventType'); 
goog.provide('goog.fx.Animation.State'); 
goog.provide('goog.fx.AnimationEvent'); 
goog.require('goog.Timer'); 
goog.require('goog.array'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventTarget'); 
goog.require('goog.object'); 
goog.fx.Animation = function(start, end, duration, opt_acc) { 
  goog.events.EventTarget.call(this); 
  if(! goog.isArray(start) || ! goog.isArray(end)) { 
    throw Error('Start and end parameters must be arrays'); 
  } 
  if(start.length != end.length) { 
    throw Error('Start and end points must be the same length'); 
  } 
  this.startPoint = start; 
  this.endPoint = end; 
  this.duration = duration; 
  this.accel_ = opt_acc; 
  this.coords =[]; 
}; 
goog.inherits(goog.fx.Animation, goog.events.EventTarget); 
goog.fx.Animation.EventType = { 
  PLAY: 'play', 
  BEGIN: 'begin', 
  RESUME: 'resume', 
  END: 'end', 
  STOP: 'stop', 
  FINISH: 'finish', 
  PAUSE: 'pause', 
  ANIMATE: 'animate', 
  DESTROY: 'destroy' 
}; 
goog.fx.Animation.State = { 
  STOPPED: 0, 
  PAUSED: - 1, 
  PLAYING: 1 
}; 
goog.fx.Animation.TIMEOUT = 20; 
goog.fx.Animation.activeAnimations_ = { }; 
goog.fx.Animation.globalTimer_ = null; 
goog.fx.Animation.cycleAnimations_ = function() { 
  goog.Timer.defaultTimerObject.clearTimeout(goog.fx.Animation.globalTimer_); 
  var now = goog.now(); 
  for(var uid in goog.fx.Animation.activeAnimations_) { 
    goog.fx.Animation.activeAnimations_[uid].cycle(now); 
  } 
  goog.fx.Animation.globalTimer_ = goog.object.isEmpty(goog.fx.Animation.activeAnimations_) ? null: goog.Timer.defaultTimerObject.setTimeout(goog.fx.Animation.cycleAnimations_, goog.fx.Animation.TIMEOUT); 
}; 
goog.fx.Animation.registerAnimation = function(animation) { 
  var uid = goog.getUid(animation); 
  if(!(uid in goog.fx.Animation.activeAnimations_)) { 
    goog.fx.Animation.activeAnimations_[uid]= animation; 
  } 
  if(! goog.fx.Animation.globalTimer_) { 
    goog.fx.Animation.globalTimer_ = goog.Timer.defaultTimerObject.setTimeout(goog.fx.Animation.cycleAnimations_, goog.fx.Animation.TIMEOUT); 
  } 
}; 
goog.fx.Animation.unregisterAnimation = function(animation) { 
  var uid = goog.getUid(animation); 
  delete goog.fx.Animation.activeAnimations_[uid]; 
  if(goog.fx.Animation.globalTimer_ && goog.object.isEmpty(goog.fx.Animation.activeAnimations_)) { 
    goog.Timer.defaultTimerObject.clearTimeout(goog.fx.Animation.globalTimer_); 
    goog.fx.Animation.globalTimer_ = null; 
  } 
}; 
goog.fx.Animation.prototype.state_ = goog.fx.Animation.State.STOPPED; 
goog.fx.Animation.prototype.fps_ = 0; 
goog.fx.Animation.prototype.progress = 0; 
goog.fx.Animation.prototype.startTime = null; 
goog.fx.Animation.prototype.endTime = null; 
goog.fx.Animation.prototype.lastFrame = null; 
goog.fx.Animation.prototype.getStateInternal = function() { 
  return this.state_; 
}; 
goog.fx.Animation.prototype.play = function(opt_restart) { 
  if(opt_restart || this.state_ == goog.fx.Animation.State.STOPPED) { 
    this.progress = 0; 
    this.coords = this.startPoint; 
  } else if(this.state_ == goog.fx.Animation.State.PLAYING) { 
    return false; 
  } 
  goog.fx.Animation.unregisterAnimation(this); 
  this.startTime =(goog.now()); 
  if(this.state_ == goog.fx.Animation.State.PAUSED) { 
    this.startTime -= this.duration * this.progress; 
  } 
  this.endTime = this.startTime + this.duration; 
  this.lastFrame = this.startTime; 
  if(! this.progress) { 
    this.onBegin(); 
  } 
  this.onPlay(); 
  if(this.state_ == goog.fx.Animation.State.PAUSED) { 
    this.onResume(); 
  } 
  this.state_ = goog.fx.Animation.State.PLAYING; 
  goog.fx.Animation.registerAnimation(this); 
  this.cycle(this.startTime); 
  return true; 
}; 
goog.fx.Animation.prototype.stop = function(gotoEnd) { 
  goog.fx.Animation.unregisterAnimation(this); 
  this.state_ = goog.fx.Animation.State.STOPPED; 
  if(gotoEnd) { 
    this.progress = 1; 
  } 
  this.updateCoords_(this.progress); 
  this.onStop(); 
  this.onEnd(); 
}; 
goog.fx.Animation.prototype.pause = function() { 
  if(this.state_ == goog.fx.Animation.State.PLAYING) { 
    goog.fx.Animation.unregisterAnimation(this); 
    this.state_ = goog.fx.Animation.State.PAUSED; 
    this.onPause(); 
  } 
}; 
goog.fx.Animation.prototype.disposeInternal = function() { 
  if(this.state_ != goog.fx.Animation.State.STOPPED) { 
    this.stop(false); 
  } 
  this.onDestroy(); 
  goog.fx.Animation.superClass_.disposeInternal.call(this); 
}; 
goog.fx.Animation.prototype.destroy = function() { 
  this.dispose(); 
}; 
goog.fx.Animation.prototype.cycle = function(now) { 
  this.progress =(now - this.startTime) /(this.endTime - this.startTime); 
  if(this.progress >= 1) { 
    this.progress = 1; 
  } 
  this.fps_ = 1000 /(now - this.lastFrame); 
  this.lastFrame = now; 
  if(goog.isFunction(this.accel_)) { 
    this.updateCoords_(this.accel_(this.progress)); 
  } else { 
    this.updateCoords_(this.progress); 
  } 
  if(this.progress == 1) { 
    this.state_ = goog.fx.Animation.State.STOPPED; 
    goog.fx.Animation.unregisterAnimation(this); 
    this.onFinish(); 
    this.onEnd(); 
  } else if(this.state_ == goog.fx.Animation.State.PLAYING) { 
    this.onAnimate(); 
  } 
}; 
goog.fx.Animation.prototype.updateCoords_ = function(t) { 
  this.coords = new Array(this.startPoint.length); 
  for(var i = 0; i < this.startPoint.length; i ++) { 
    this.coords[i]=(this.endPoint[i]- this.startPoint[i]) * t + this.startPoint[i]; 
  } 
}; 
goog.fx.Animation.prototype.onAnimate = function() { 
  this.dispatchAnimationEvent_(goog.fx.Animation.EventType.ANIMATE); 
}; 
goog.fx.Animation.prototype.onBegin = function() { 
  this.dispatchAnimationEvent_(goog.fx.Animation.EventType.BEGIN); 
}; 
goog.fx.Animation.prototype.onDestroy = function() { 
  this.dispatchAnimationEvent_(goog.fx.Animation.EventType.DESTROY); 
}; 
goog.fx.Animation.prototype.onEnd = function() { 
  this.dispatchAnimationEvent_(goog.fx.Animation.EventType.END); 
}; 
goog.fx.Animation.prototype.onFinish = function() { 
  this.dispatchAnimationEvent_(goog.fx.Animation.EventType.FINISH); 
}; 
goog.fx.Animation.prototype.onPause = function() { 
  this.dispatchAnimationEvent_(goog.fx.Animation.EventType.PAUSE); 
}; 
goog.fx.Animation.prototype.onPlay = function() { 
  this.dispatchAnimationEvent_(goog.fx.Animation.EventType.PLAY); 
}; 
goog.fx.Animation.prototype.onResume = function() { 
  this.dispatchAnimationEvent_(goog.fx.Animation.EventType.RESUME); 
}; 
goog.fx.Animation.prototype.onStop = function() { 
  this.dispatchAnimationEvent_(goog.fx.Animation.EventType.STOP); 
}; 
goog.fx.Animation.prototype.dispatchAnimationEvent_ = function(type) { 
  this.dispatchEvent(new goog.fx.AnimationEvent(type, this)); 
}; 
goog.fx.AnimationEvent = function(type, anim) { 
  goog.events.Event.call(this, type); 
  this.coords = anim.coords; 
  this.x = anim.coords[0]; 
  this.y = anim.coords[1]; 
  this.z = anim.coords[2]; 
  this.duration = anim.duration; 
  this.progress = anim.progress; 
  this.fps = anim.fps_; 
  this.state = anim.state_; 
  this.anim = anim; 
}; 
goog.inherits(goog.fx.AnimationEvent, goog.events.Event); 
goog.fx.AnimationEvent.prototype.coordsAsInts = function() { 
  return goog.array.map(this.coords, Math.round); 
}; 

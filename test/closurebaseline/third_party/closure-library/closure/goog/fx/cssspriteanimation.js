
goog.provide('goog.fx.CssSpriteAnimation'); 
goog.require('goog.fx.Animation'); 
goog.fx.CssSpriteAnimation = function(element, size, box, time, opt_acc) { 
  var start =[box.left, box.top]; 
  var end =[box.right, box.bottom]; 
  goog.fx.Animation.call(this, start, end, time, opt_acc); 
  this.element_ = element; 
  this.size_ = size; 
}; 
goog.inherits(goog.fx.CssSpriteAnimation, goog.fx.Animation); 
goog.fx.CssSpriteAnimation.prototype.onAnimate = function() { 
  var x = - Math.floor(this.coords[0]/ this.size_.width) * this.size_.width; 
  var y = - Math.floor(this.coords[1]/ this.size_.height) * this.size_.height; 
  this.element_.style.backgroundPosition = x + 'px ' + y + 'px'; 
  goog.fx.CssSpriteAnimation.superClass_.onAnimate.call(this); 
}; 
goog.fx.CssSpriteAnimation.prototype.onFinish = function() { 
  this.play(true); 
  goog.fx.CssSpriteAnimation.superClass_.onFinish.call(this); 
}; 
goog.fx.CssSpriteAnimation.prototype.clearSpritePosition = function() { 
  var style = this.element_.style; 
  style.backgroundPosition = ''; 
  if(typeof style.backgroundPositionX != 'undefined') { 
    style.backgroundPositionX = ''; 
    style.backgroundPositionY = ''; 
  } 
}; 
goog.fx.CssSpriteAnimation.prototype.disposeInternal = function() { 
  goog.fx.CssSpriteAnimation.superClass_.disposeInternal.call(this); 
  this.element_ = null; 
}; 

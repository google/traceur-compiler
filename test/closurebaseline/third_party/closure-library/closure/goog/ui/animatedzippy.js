
goog.provide('goog.ui.AnimatedZippy'); 
goog.require('goog.dom'); 
goog.require('goog.events'); 
goog.require('goog.fx.Animation'); 
goog.require('goog.fx.easing'); 
goog.require('goog.ui.Zippy'); 
goog.require('goog.ui.ZippyEvent'); 
goog.ui.AnimatedZippy = function(header, content, opt_expanded) { 
  var elWrapper = goog.dom.createDom('div', { 'style': 'overflow:hidden' }); 
  var elContent = goog.dom.getElement(content); 
  elContent.parentNode.replaceChild(elWrapper, elContent); 
  elWrapper.appendChild(elContent); 
  this.elWrapper_ = elWrapper; 
  this.anim_ = null; 
  goog.ui.Zippy.call(this, header, elContent, opt_expanded); 
  var expanded = this.isExpanded(); 
  this.elWrapper_.style.display = expanded ? '': 'none'; 
  this.updateHeaderClassName(expanded); 
}; 
goog.inherits(goog.ui.AnimatedZippy, goog.ui.Zippy); 
goog.ui.AnimatedZippy.prototype.animationDuration = 500; 
goog.ui.AnimatedZippy.prototype.animationAcceleration = goog.fx.easing.easeOut; 
goog.ui.Zippy.prototype.isBusy = function() { 
  return this.anim_ != null; 
}; 
goog.ui.AnimatedZippy.prototype.setExpanded = function(expanded) { 
  if(this.isExpanded() == expanded && ! this.anim_) { 
    return; 
  } 
  if(this.elWrapper_.style.display == 'none') { 
    this.elWrapper_.style.display = ''; 
  } 
  var h = this.getContentElement().offsetHeight; 
  var startH = 0; 
  if(this.anim_) { 
    expanded = this.isExpanded(); 
    goog.events.removeAll(this.anim_); 
    this.anim_.stop(false); 
    var marginTop = parseInt(this.getContentElement().style.marginTop, 10); 
    startH = h - Math.abs(marginTop); 
  } else { 
    startH = expanded ? 0: h; 
  } 
  this.updateHeaderClassName(expanded); 
  this.anim_ = new goog.fx.Animation([0, startH],[0, expanded ? h: 0], this.animationDuration, this.animationAcceleration); 
  var events =[goog.fx.Animation.EventType.BEGIN, goog.fx.Animation.EventType.ANIMATE, goog.fx.Animation.EventType.END]; 
  goog.events.listen(this.anim_, events, this.onAnimate_, false, this); 
  goog.events.listen(this.anim_, goog.fx.Animation.EventType.END, goog.bind(this.onAnimationCompleted_, this, expanded)); 
  this.anim_.play(false); 
}; 
goog.ui.AnimatedZippy.prototype.onAnimate_ = function(e) { 
  var contentElement = this.getContentElement(); 
  var h = contentElement.offsetHeight; 
  contentElement.style.marginTop =(e.y - h) + 'px'; 
}; 
goog.ui.AnimatedZippy.prototype.onAnimationCompleted_ = function(expanded) { 
  if(expanded) { 
    this.getContentElement().style.marginTop = '0'; 
  } 
  goog.events.removeAll(this.anim_); 
  this.setExpandedInternal(expanded); 
  this.anim_ = null; 
  if(! expanded) { 
    this.elWrapper_.style.display = 'none'; 
  } 
  this.dispatchEvent(new goog.ui.ZippyEvent(goog.ui.Zippy.Events.TOGGLE, this, expanded)); 
}; 

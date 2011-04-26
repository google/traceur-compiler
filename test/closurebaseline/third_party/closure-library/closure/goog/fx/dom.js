
goog.provide('goog.fx.dom'); 
goog.provide('goog.fx.dom.BgColorTransform'); 
goog.provide('goog.fx.dom.ColorTransform'); 
goog.provide('goog.fx.dom.Fade'); 
goog.provide('goog.fx.dom.FadeIn'); 
goog.provide('goog.fx.dom.FadeInAndShow'); 
goog.provide('goog.fx.dom.FadeOut'); 
goog.provide('goog.fx.dom.FadeOutAndHide'); 
goog.provide('goog.fx.dom.PredefinedEffect'); 
goog.provide('goog.fx.dom.Resize'); 
goog.provide('goog.fx.dom.ResizeHeight'); 
goog.provide('goog.fx.dom.ResizeWidth'); 
goog.provide('goog.fx.dom.Scroll'); 
goog.provide('goog.fx.dom.Slide'); 
goog.provide('goog.fx.dom.SlideFrom'); 
goog.provide('goog.fx.dom.Swipe'); 
goog.require('goog.color'); 
goog.require('goog.events'); 
goog.require('goog.fx.Animation'); 
goog.require('goog.fx.Animation.EventType'); 
goog.require('goog.style'); 
goog.fx.dom.PredefinedEffect = function(element, start, end, time, opt_acc) { 
  goog.fx.Animation.call(this, start, end, time, opt_acc); 
  this.element = element; 
}; 
goog.inherits(goog.fx.dom.PredefinedEffect, goog.fx.Animation); 
goog.fx.dom.PredefinedEffect.prototype.updateStyle = goog.nullFunction; 
goog.fx.dom.PredefinedEffect.prototype.onAnimate = function() { 
  this.updateStyle(); 
  goog.fx.dom.PredefinedEffect.superClass_.onAnimate.call(this); 
}; 
goog.fx.dom.PredefinedEffect.prototype.onEnd = function() { 
  this.updateStyle(); 
  goog.fx.dom.PredefinedEffect.superClass_.onEnd.call(this); 
}; 
goog.fx.dom.PredefinedEffect.prototype.onBegin = function() { 
  this.updateStyle(); 
  goog.fx.dom.PredefinedEffect.superClass_.onBegin.call(this); 
}; 
goog.fx.dom.Slide = function(element, start, end, time, opt_acc) { 
  if(start.length != 2 || end.length != 2) { 
    throw Error('Start and end points must be 2D'); 
  } 
  goog.fx.dom.PredefinedEffect.apply(this, arguments); 
}; 
goog.inherits(goog.fx.dom.Slide, goog.fx.dom.PredefinedEffect); 
goog.fx.dom.Slide.prototype.updateStyle = function() { 
  this.element.style.left = Math.round(this.coords[0]) + 'px'; 
  this.element.style.top = Math.round(this.coords[1]) + 'px'; 
}; 
goog.fx.dom.SlideFrom = function(element, end, time, opt_acc) { 
  var start =[element.offsetLeft, element.offsetTop]; 
  goog.fx.dom.Slide.call(this, element, start, end, time, opt_acc); 
}; 
goog.inherits(goog.fx.dom.SlideFrom, goog.fx.dom.Slide); 
goog.fx.dom.SlideFrom.prototype.onBegin = function() { 
  this.startPoint =[this.element.offsetLeft, this.element.offsetTop]; 
  goog.fx.dom.SlideFrom.superClass_.onBegin.call(this); 
}; 
goog.fx.dom.Swipe = function(element, start, end, time, opt_acc) { 
  if(start.length != 2 || end.length != 2) { 
    throw Error('Start and end points must be 2D'); 
  } 
  goog.fx.dom.PredefinedEffect.apply(this, arguments); 
  this.maxWidth_ = Math.max(this.endPoint[0], this.startPoint[0]); 
  this.maxHeight_ = Math.max(this.endPoint[1], this.startPoint[1]); 
}; 
goog.inherits(goog.fx.dom.Swipe, goog.fx.dom.PredefinedEffect); 
goog.fx.dom.Swipe.prototype.updateStyle = function() { 
  var x = this.coords[0]; 
  var y = this.coords[1]; 
  this.clip_(Math.round(x), Math.round(y), this.maxWidth_, this.maxHeight_); 
  this.element.style.width = Math.round(x) + 'px'; 
  this.element.style.marginLeft = Math.round(x) - this.maxWidth_ + 'px'; 
  this.element.style.marginTop = Math.round(y) - this.maxHeight_ + 'px'; 
}; 
goog.fx.dom.Swipe.prototype.clip_ = function(x, y, w, h) { 
  this.element.style.clip = 'rect(' +(h - y) + 'px ' + w + 'px ' + h + 'px ' +(w - x) + 'px)'; 
}; 
goog.fx.dom.Scroll = function(element, start, end, time, opt_acc) { 
  if(start.length != 2 || end.length != 2) { 
    throw Error('Start and end points must be 2D'); 
  } 
  goog.fx.dom.PredefinedEffect.apply(this, arguments); 
}; 
goog.inherits(goog.fx.dom.Scroll, goog.fx.dom.PredefinedEffect); 
goog.fx.dom.Scroll.prototype.updateStyle = function() { 
  this.element.scrollLeft = Math.round(this.coords[0]); 
  this.element.scrollTop = Math.round(this.coords[1]); 
}; 
goog.fx.dom.Resize = function(element, start, end, time, opt_acc) { 
  if(start.length != 2 || end.length != 2) { 
    throw Error('Start and end points must be 2D'); 
  } 
  goog.fx.dom.PredefinedEffect.apply(this, arguments); 
}; 
goog.inherits(goog.fx.dom.Resize, goog.fx.dom.PredefinedEffect); 
goog.fx.dom.Resize.prototype.updateStyle = function() { 
  this.element.style.width = Math.round(this.coords[0]) + 'px'; 
  this.element.style.height = Math.round(this.coords[1]) + 'px'; 
}; 
goog.fx.dom.ResizeWidth = function(element, start, end, time, opt_acc) { 
  goog.fx.dom.PredefinedEffect.call(this, element,[start],[end], time, opt_acc); 
}; 
goog.inherits(goog.fx.dom.ResizeWidth, goog.fx.dom.PredefinedEffect); 
goog.fx.dom.ResizeWidth.prototype.updateStyle = function() { 
  this.element.style.width = Math.round(this.coords[0]) + 'px'; 
}; 
goog.fx.dom.ResizeHeight = function(element, start, end, time, opt_acc) { 
  goog.fx.dom.PredefinedEffect.call(this, element,[start],[end], time, opt_acc); 
}; 
goog.inherits(goog.fx.dom.ResizeHeight, goog.fx.dom.PredefinedEffect); 
goog.fx.dom.ResizeHeight.prototype.updateStyle = function() { 
  this.element.style.height = Math.round(this.coords[0]) + 'px'; 
}; 
goog.fx.dom.Fade = function(element, start, end, time, opt_acc) { 
  if(goog.isNumber(start)) start =[start]; 
  if(goog.isNumber(end)) end =[end]; 
  goog.fx.dom.PredefinedEffect.call(this, element, start, end, time, opt_acc); 
  if(start.length != 1 || end.length != 1) { 
    throw Error('Start and end points must be 1D'); 
  } 
}; 
goog.inherits(goog.fx.dom.Fade, goog.fx.dom.PredefinedEffect); 
goog.fx.dom.Fade.prototype.updateStyle = function() { 
  goog.style.setOpacity(this.element, this.coords[0]); 
}; 
goog.fx.dom.Fade.prototype.show = function() { 
  this.element.style.display = ''; 
}; 
goog.fx.dom.Fade.prototype.hide = function() { 
  this.element.style.display = 'none'; 
}; 
goog.fx.dom.FadeOut = function(element, time, opt_acc) { 
  goog.fx.dom.Fade.call(this, element, 1, 0, time, opt_acc); 
}; 
goog.inherits(goog.fx.dom.FadeOut, goog.fx.dom.Fade); 
goog.fx.dom.FadeIn = function(element, time, opt_acc) { 
  goog.fx.dom.Fade.call(this, element, 0, 1, time, opt_acc); 
}; 
goog.inherits(goog.fx.dom.FadeIn, goog.fx.dom.Fade); 
goog.fx.dom.FadeOutAndHide = function(element, time, opt_acc) { 
  goog.fx.dom.Fade.call(this, element, 1, 0, time, opt_acc); 
}; 
goog.inherits(goog.fx.dom.FadeOutAndHide, goog.fx.dom.Fade); 
goog.fx.dom.FadeOutAndHide.prototype.onBegin = function() { 
  this.show(); 
  goog.fx.dom.FadeOutAndHide.superClass_.onBegin.call(this); 
}; 
goog.fx.dom.FadeOutAndHide.prototype.onEnd = function() { 
  this.hide(); 
  goog.fx.dom.FadeOutAndHide.superClass_.onEnd.call(this); 
}; 
goog.fx.dom.FadeInAndShow = function(element, time, opt_acc) { 
  goog.fx.dom.Fade.call(this, element, 0, 1, time, opt_acc); 
}; 
goog.inherits(goog.fx.dom.FadeInAndShow, goog.fx.dom.Fade); 
goog.fx.dom.FadeInAndShow.prototype.onBegin = function() { 
  this.show(); 
  goog.fx.dom.FadeInAndShow.superClass_.onBegin.call(this); 
}; 
goog.fx.dom.BgColorTransform = function(element, start, end, time, opt_acc) { 
  if(start.length != 3 || end.length != 3) { 
    throw Error('Start and end points must be 3D'); 
  } 
  goog.fx.dom.PredefinedEffect.apply(this, arguments); 
}; 
goog.inherits(goog.fx.dom.BgColorTransform, goog.fx.dom.PredefinedEffect); 
goog.fx.dom.BgColorTransform.prototype.setColor = function() { 
  var coordsAsInts =[]; 
  for(var i = 0; i < this.coords.length; i ++) { 
    coordsAsInts[i]= Math.round(this.coords[i]); 
  } 
  var color = 'rgb(' + coordsAsInts.join(',') + ')'; 
  this.element.style.backgroundColor = color; 
}; 
goog.fx.dom.BgColorTransform.prototype.updateStyle = function() { 
  this.setColor(); 
}; 
goog.fx.dom.bgColorFadeIn = function(element, start, time, opt_eventHandler) { 
  var initialBgColor = element.style.backgroundColor || ''; 
  var computedBgColor = goog.style.getBackgroundColor(element); 
  var end; 
  if(computedBgColor != 'transparent' && computedBgColor != 'rgba(0, 0, 0, 0)') { 
    end = goog.color.hexToRgb(goog.color.parse(computedBgColor).hex); 
  } else { 
    end =[255, 255, 255]; 
  } 
  var anim = new goog.fx.dom.BgColorTransform(element, start, end, time); 
  function setBgColor() { 
    element.style.backgroundColor = initialBgColor; 
  } 
  if(opt_eventHandler) { 
    opt_eventHandler.listen(anim, goog.fx.Animation.EventType.END, setBgColor); 
  } else { 
    goog.events.listen(anim, goog.fx.Animation.EventType.END, setBgColor); 
  } 
  anim.play(); 
}; 
goog.fx.dom.ColorTransform = function(element, start, end, time, opt_acc) { 
  if(start.length != 3 || end.length != 3) { 
    throw Error('Start and end points must be 3D'); 
  } 
  goog.fx.dom.PredefinedEffect.apply(this, arguments); 
}; 
goog.inherits(goog.fx.dom.ColorTransform, goog.fx.dom.PredefinedEffect); 
goog.fx.dom.ColorTransform.prototype.updateStyle = function() { 
  var coordsAsInts =[]; 
  for(var i = 0; i < this.coords.length; i ++) { 
    coordsAsInts[i]= Math.round(this.coords[i]); 
  } 
  var color = 'rgb(' + coordsAsInts.join(',') + ')'; 
  this.element.style.color = color; 
}; 


goog.provide('goog.ui.Slider'); 
goog.provide('goog.ui.Slider.Orientation'); 
goog.require('goog.dom'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.a11y.Role'); 
goog.require('goog.ui.SliderBase'); 
goog.require('goog.ui.SliderBase.Orientation'); 
goog.ui.Slider = function(opt_domHelper) { 
  goog.ui.SliderBase.call(this, opt_domHelper); 
  this.rangeModel.setExtent(0); 
}; 
goog.inherits(goog.ui.Slider, goog.ui.SliderBase); 
goog.ui.Slider.Orientation = goog.ui.SliderBase.Orientation; 
goog.ui.Slider.CSS_CLASS_PREFIX = goog.getCssName('goog-slider'); 
goog.ui.Slider.THUMB_CSS_CLASS = goog.getCssName(goog.ui.Slider.CSS_CLASS_PREFIX, 'thumb'); 
goog.ui.Slider.prototype.getCssClass = function(orient) { 
  return orient == goog.ui.SliderBase.Orientation.VERTICAL ? goog.getCssName(goog.ui.Slider.CSS_CLASS_PREFIX, 'vertical'): goog.getCssName(goog.ui.Slider.CSS_CLASS_PREFIX, 'horizontal'); 
}; 
goog.ui.Slider.prototype.createThumbs = function() { 
  var element = this.getElement(); 
  var thumb = goog.dom.getElementsByTagNameAndClass(null, goog.ui.Slider.THUMB_CSS_CLASS, element)[0]; 
  if(! thumb) { 
    thumb = this.createThumb_(); 
    element.appendChild(thumb); 
  } 
  this.valueThumb = this.extentThumb = thumb; 
}; 
goog.ui.Slider.prototype.createThumb_ = function() { 
  var thumb = this.getDomHelper().createDom('div', goog.ui.Slider.THUMB_CSS_CLASS); 
  goog.dom.a11y.setRole(thumb, goog.dom.a11y.Role.BUTTON); 
  return(thumb); 
}; 

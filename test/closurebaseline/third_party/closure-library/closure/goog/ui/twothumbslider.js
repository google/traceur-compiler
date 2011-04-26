
goog.provide('goog.ui.TwoThumbSlider'); 
goog.require('goog.dom'); 
goog.require('goog.dom.a11y'); 
goog.require('goog.dom.a11y.Role'); 
goog.require('goog.ui.SliderBase'); 
goog.ui.TwoThumbSlider = function(opt_domHelper) { 
  goog.ui.SliderBase.call(this, opt_domHelper); 
  this.rangeModel.setValue(this.getMinimum()); 
  this.rangeModel.setExtent(this.getMaximum() - this.getMinimum()); 
}; 
goog.inherits(goog.ui.TwoThumbSlider, goog.ui.SliderBase); 
goog.ui.TwoThumbSlider.CSS_CLASS_PREFIX = goog.getCssName('goog-twothumbslider'); 
goog.ui.TwoThumbSlider.VALUE_THUMB_CSS_CLASS = goog.getCssName(goog.ui.TwoThumbSlider.CSS_CLASS_PREFIX, 'value-thumb'); 
goog.ui.TwoThumbSlider.EXTENT_THUMB_CSS_CLASS = goog.getCssName(goog.ui.TwoThumbSlider.CSS_CLASS_PREFIX, 'extent-thumb'); 
goog.ui.TwoThumbSlider.prototype.getCssClass = function(orient) { 
  return goog.ui.TwoThumbSlider.CSS_CLASS_PREFIX + '-' + orient; 
}; 
goog.ui.TwoThumbSlider.prototype.createThumb_ = function(cs) { 
  var thumb = this.getDomHelper().createDom('div', cs); 
  goog.dom.a11y.setRole(thumb, goog.dom.a11y.Role.BUTTON); 
  return(thumb); 
}; 
goog.ui.TwoThumbSlider.prototype.createThumbs = function() { 
  var valueThumb = goog.dom.getElementsByTagNameAndClass(null, goog.ui.TwoThumbSlider.VALUE_THUMB_CSS_CLASS, this.getElement())[0]; 
  var extentThumb = goog.dom.getElementsByTagNameAndClass(null, goog.ui.TwoThumbSlider.EXTENT_THUMB_CSS_CLASS, this.getElement())[0]; 
  if(! valueThumb) { 
    valueThumb = this.createThumb_(goog.ui.TwoThumbSlider.VALUE_THUMB_CSS_CLASS); 
    this.getElement().appendChild(valueThumb); 
  } 
  if(! extentThumb) { 
    extentThumb = this.createThumb_(goog.ui.TwoThumbSlider.EXTENT_THUMB_CSS_CLASS); 
    this.getElement().appendChild(extentThumb); 
  } 
  this.valueThumb = valueThumb; 
  this.extentThumb = extentThumb; 
}; 

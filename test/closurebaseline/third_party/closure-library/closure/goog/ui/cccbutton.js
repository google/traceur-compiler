
goog.provide('goog.ui.CccButton'); 
goog.require('goog.dom'); 
goog.require('goog.dom.classes'); 
goog.require('goog.events'); 
goog.require('goog.events.Event'); 
goog.require('goog.events.EventType'); 
goog.require('goog.ui.DeprecatedButton'); 
goog.require('goog.userAgent'); 
goog.ui.CccButton = function(opt_class, opt_noPoundSignInHref) { 
  var className = opt_class ? opt_class: goog.getCssName('goog-cccbutton'); 
  goog.ui.DeprecatedButton.call(this, className); 
  this.noPoundSignInHref_ = opt_noPoundSignInHref || false; 
}; 
goog.inherits(goog.ui.CccButton, goog.ui.DeprecatedButton); 
goog.ui.CccButton.BASE_ID_ = 'goog.ui.CccButton.'; 
goog.ui.CccButton.nextId_ = 0; 
goog.ui.CccButton.getNextUniqueId = function() { 
  return goog.ui.CccButton.BASE_ID_ + String(goog.ui.CccButton.nextId_ ++); 
}; 
goog.ui.CccButton.prototype.getNextUniqueId_ = function() { 
  return goog.ui.CccButton.getNextUniqueId(); 
}; 
goog.ui.DeprecatedButton.prototype.captionEl_ = null; 
goog.ui.CccButton.ENABLED_CLASS_ADDITION_ = '-enabled'; 
goog.ui.CccButton.DISABLED_CLASS_ADDITION_ = '-disabled'; 
goog.ui.CccButton.prototype.getEnabledClass = function() { 
  return this.class_ + goog.ui.CccButton.ENABLED_CLASS_ADDITION_; 
}; 
goog.ui.CccButton.prototype.getDisabledClass = function() { 
  return this.class_ + goog.ui.CccButton.DISABLED_CLASS_ADDITION_; 
}; 
goog.ui.CccButton.prototype.setCaption = function(caption) { 
  this.caption_ = caption; 
  if(this.isRendered()) { 
    var element = this.captionEl_; 
    element.innerHTML = ''; 
    var domHelper = goog.dom.getDomHelper(element); 
    domHelper.appendChild(element, domHelper.createTextNode(caption)); 
  } 
}; 
goog.ui.CccButton.prototype.setEnabled = function(enable) { 
  if(this.getEnabled() != enable && this.dispatchEvent(goog.ui.DeprecatedButton.EventType.ENABLE)) { 
    if(this.isRendered()) { 
      var element = this.getElement(); 
      var fromClass = ! enable ? this.getEnabledClass(): this.getDisabledClass(); 
      var toClass = enable ? this.getEnabledClass(): this.getDisabledClass(); 
      goog.dom.classes.swap(element, fromClass, toClass); 
    } 
    this.enabled_ = enable; 
  } 
}; 
goog.ui.CccButton.prototype.render = function(opt_element) { 
  if(this.isRendered()) { 
    throw Error('Compenent already rendered'); 
  } 
  var domHelper = goog.dom.getDomHelper(opt_element); 
  var hrefString = goog.userAgent.IE ? '#': 'javascript:;'; 
  hrefString = this.noPoundSignInHref_ ? 'javascript:;': hrefString; 
  var element = domHelper.createDom('a', { 
    title: this.tooltip_, 
    className: this.class_ + ' ' +(this.enabled_ ? this.getEnabledClass(): this.getDisabledClass()), 
    href: hrefString 
  }, domHelper.createDom('b', { }, domHelper.createDom('b', { }, this.captionEl_ = domHelper.createDom('b', { }, this.caption_)))); 
  var parentElement = opt_element || domHelper.getDocument().body; 
  domHelper.appendChild(parentElement, element); 
  goog.events.listen(element, goog.events.EventType.CLICK, this.onClick_, true, this); 
  this.element_ = element; 
  this.rendered_ = true; 
}; 
goog.ui.CccButton.prototype.isValidButtonChildHelper_ = function(element, tag) { 
  var domHelper = goog.dom.getDomHelper(element); 
  var firstChild = element ? domHelper.getFirstElementChild(element): null; 
  if(firstChild && firstChild.tagName.toLowerCase() == tag && element.childNodes.length == 1) { 
    return true; 
  } 
  return false; 
}; 
goog.ui.CccButton.prototype.decorate = function(element) { 
  if(this.isRendered()) { 
    throw Error('Component already rendered'); 
  } else { 
    var domHelper = goog.dom.getDomHelper(element); 
    var firstElement = element ? domHelper.getFirstElementChild(element): null; 
    var secondElement = firstElement ? domHelper.getFirstElementChild(firstElement): null; 
    if(element && element.tagName.toLowerCase() == 'a' && this.isValidButtonChildHelper_(element, 'b') && this.isValidButtonChildHelper_(firstElement, 'b') && this.isValidButtonChildHelper_(secondElement, 'b')) { 
      this.element_ = element; 
      this.setCaption(secondElement.firstChild.innerHTML); 
      this.setTooltip(element.title); 
      this.class_ = element.className; 
      this.rendered_ = true; 
    } else { 
      throw Error('Invalid element to decorate'); 
    } 
  } 
}; 
